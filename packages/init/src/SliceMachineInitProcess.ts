import * as fs from "node:fs/promises";
import * as path from "node:path";

import chalk from "chalk";
import { ExecaChildProcess } from "execa";
import open from "open";
import logSymbols from "log-symbols";
import { globby } from "globby";

import {
	createSliceMachineManager,
	PrismicUserProfile,
	PrismicRepository,
	SliceMachineManager,
} from "@slicemachine/manager";

import { detectFramework, Framework } from "./lib/framework";
import {
	installDependencies,
	detectPackageManager,
	PackageManagerAgent,
	getRunScriptCommand,
	getExecuteCommand,
} from "./lib/packageManager";
import {
	getRandomRepositoryDomain,
	formatRepositoryDomain,
	validateRepositoryDomain,
	validateRepositoryDomainAndAvailability,
	getErrorMessageForRepositoryDomainValidation,
} from "./lib/repositoryDomain";
import { listr, listrRun } from "./lib/listr";
import { prompt } from "./lib/prompt";
import { assertExists } from "./lib/assertExists";
import { START_SCRIPT_KEY, START_SCRIPT_VALUE } from "./constants";

export type SliceMachineInitProcessOptions = {
	repository?: string;
	push?: boolean;
	pushSlices?: boolean;
	pushCustomTypes?: boolean;
	pushDocuments?: boolean;
	cwd?: string;
} & Record<string, unknown>;

const DEFAULT_OPTIONS: SliceMachineInitProcessOptions = {
	push: true,
	pushSlices: true,
	pushCustomTypes: true,
	pushDocuments: true,
};

export const createSliceMachineInitProcess = (
	options?: SliceMachineInitProcessOptions,
): SliceMachineInitProcess => {
	return new SliceMachineInitProcess(options);
};

type SliceMachineInitProcessContext = {
	framework?: Framework;
	packageManager?: PackageManagerAgent;
	installProcess?: ExecaChildProcess;
	userProfile?: PrismicUserProfile;
	userRepositories?: PrismicRepository[];
	repository?: {
		domain: string;
		exists: boolean;
	};
	projectInitialization?: {
		patchedScript?: boolean;
	};
};

export class SliceMachineInitProcess {
	protected options: SliceMachineInitProcessOptions;
	protected manager: SliceMachineManager;

	protected context: SliceMachineInitProcessContext;

	constructor(options?: SliceMachineInitProcessOptions) {
		this.options = { ...DEFAULT_OPTIONS, ...options };
		this.manager = createSliceMachineManager({ cwd: options?.cwd });

		this.context = {};
	}

	async run(): Promise<void> {
		// We prefer to manually allow console logs despite the app being a CLI to catch wild/unwanted console logs better
		// eslint-disable-next-line no-console
		console.log(
			`\n${chalk.bgGray(` ${chalk.bold.white("Slice Machine")} `)} ${chalk.dim(
				"→",
			)} Init command started\n`,
		);

		await this.manager.telemetry.initTelemetry();
		await this.manager.telemetry.track({
			event: "command:init:start",
			repository: this.options.repository,
		});

		try {
			await this.detectEnvironment();

			assertExists(
				this.context.framework,
				"Project framework must be available through context to proceed",
			);

			await this.beginCoreDependenciesInstallation();
			await this.loginAndFetchUserData();

			if (this.options.repository) {
				await this.useRepositoryFlag();
			} else {
				await this.selectRepository();
			}

			assertExists(
				this.context.repository,
				"Repository selection must be available through context to proceed",
			);

			if (!this.context.repository.exists) {
				await this.createNewRepository();
			}

			await this.finishCoreDependenciesInstallation();
			await this.upsertSliceMachineConfigurationAndStartPluginRunner();
			await this.pushDataToPrismic();
			await this.initializeProject();
			await this.initializePlugins();
		} catch (error) {
			await this.trackError(error);

			throw error;
		}

		await this.manager.telemetry.track({
			event: "command:init:end",
			framework: this.context.framework.prismicName,
			repository: this.context.repository.domain,
			success: true,
		});

		// We prefer to manually allow console logs despite the app being a CLI to catch wild/unwanted console logs better
		// eslint-disable-next-line no-console
		console.log(
			`\n${chalk.bgGreen(` ${chalk.bold.white("Slice Machine")} `)} ${chalk.dim(
				"→",
			)} Init command successful!`,
		);

		try {
			// We prefer to manually allow console logs despite the app being a CLI to catch wild/unwanted console logs better
			// eslint-disable-next-line no-console
			console.log(`
  YOUR REPOSITORY
    Dashboard            ${chalk.cyan(
			`https://${this.context.repository.domain}.prismic.io`,
		)}
    API                  ${chalk.cyan(
			`https://${this.context.repository.domain}.cdn.prismic.io/api/v2`,
		)}

  RESOURCES
    Documentation        ${chalk.cyan(
			this.context.framework.prismicDocumentation,
		)}
    Getting help         ${chalk.cyan("https://community.prismic.io")}

  GETTING STARTED
    Start Slice Machine  ${chalk.cyan(
			this.context.projectInitialization?.patchedScript
				? await getRunScriptCommand({
						agent: this.context.packageManager || "npm",
						script: "slicemachine",
				  })
				: await getExecuteCommand({
						agent: this.context.packageManager || "npm",
						script: "start-slicemachine",
				  }),
		)}`);
		} catch {
			// Noop, it's only the final convenience messsage
		}
	}

	protected trackError = (error: unknown): Promise<void> => {
		// Transform error to string and prevent hitting Segment 500kb API limit or sending ridiculously long trace
		const safeError = (
			error instanceof Error ? error.message : `${error}`
		).slice(0, 512);

		return this.manager.telemetry.track({
			event: "command:init:end",
			framework: this.context.framework?.prismicName ?? "unknown",
			repository: this.context.repository?.domain,
			success: false,
			error: safeError,
		});
	};

	protected detectEnvironment(): Promise<void> {
		return listrRun([
			{
				title: "Detecting environment...",
				task: (_, parentTask) =>
					listr([
						{
							title: "Detecting framework...",
							task: async (_, task) => {
								this.context.framework = await detectFramework(
									this.manager.cwd,
								);

								task.title = `Detected framework ${chalk.cyan(
									this.context.framework.name,
								)}`;
							},
						},
						{
							title: "Detecting package manager...",
							task: async (_, task) => {
								try {
									this.context.packageManager = await detectPackageManager(
										this.options.cwd,
									);
								} catch (error) {
									// Default to NPM
									if (
										error instanceof Error &&
										(error.message.match(/failed to detect/i) ||
											error.message.match(/command failed/i))
									) {
										this.context.packageManager = "npm";
									} else {
										throw error;
									}
								}

								task.title = `Detected package manager ${chalk.cyan(
									this.context.packageManager,
								)}`;

								assertExists(
									this.context.framework,
									"Project framework must be available through context to proceed",
								);
								parentTask.title = `Detected framework ${chalk.cyan(
									this.context.framework.name,
								)} and package manager ${chalk.cyan(
									this.context.packageManager,
								)}`;
							},
						},
					]),
			},
		]);
	}

	protected beginCoreDependenciesInstallation(): Promise<void> {
		return listrRun([
			{
				title: "Beginning core dependencies installation...",
				task: async (_, task) => {
					assertExists(
						this.context.packageManager,
						"Project package manager must be available through context to run `beginCoreDependenciesInstallation`",
					);
					assertExists(
						this.context.framework,
						"Project framework must be available through context to run `beginCoreDependenciesInstallation`",
					);

					const { execaProcess } = await installDependencies({
						agent: this.context.packageManager,
						dependencies: this.context.framework.devDependencies,
						dev: true,
					});

					// Fail hard if process fails
					execaProcess.catch(async (error) => {
						const [_, ...argv1n] = process.argv;
						// Command the user used
						let tryAgainCommand = [process.argv0, ...argv1n].join(" ");

						// If the `repository` option wasn't used AND the repository was selected/created
						if (!this.options.repository && this.context.repository) {
							tryAgainCommand = `${tryAgainCommand} --repository=${this.context.repository.domain}`;
						}

						await this.trackError(error.shortMessage);
						console.error(
							`\n\n${error.shortMessage}\n${error.stderr}\n\n${
								logSymbols.error
							} Dependency installation failed, try again with:\n\n  ${chalk.gray(
								"$",
							)} ${chalk.cyan(tryAgainCommand)}`,
						);

						process.exit(1);
					});

					this.context.installProcess = execaProcess;

					task.title = `Began core dependencies installation with ${chalk.cyan(
						this.context.packageManager,
					)} ... (running in background)`;
				},
			},
		]);
	}

	protected loginAndFetchUserData(): Promise<void> {
		return listrRun([
			{
				title: "Logging in to Prismic...",
				task: async (_, parentTask) => {
					parentTask.output = "Validating session...";
					const isLoggedIn = await this.manager.user.checkIsLoggedIn();

					if (!isLoggedIn) {
						parentTask.output = "Press any key to open the browser to login...";
						await new Promise((resolve) => {
							const initialRawMode = !!process.stdin.isRaw;
							process.stdin.setRawMode?.(true);
							process.stdin.once("data", (data: Buffer) => {
								process.stdin.setRawMode?.(initialRawMode);
								process.stdin.pause();
								resolve(data.toString("utf-8"));
							});
						});

						parentTask.output = "Browser opened, waiting for you to login...";
						const { port, url } = await this.manager.user.getLoginSessionInfo();
						await this.manager.user.nodeLoginSession({
							port,
							onListenCallback() {
								open(url);
							},
						});
					}

					parentTask.output = "";
					parentTask.title = `Logged in`;

					return listr(
						[
							{
								title: "Fetching user profile...",
								task: async (_, task) => {
									this.context.userProfile =
										await this.manager.user.getProfile();

									await this.manager.telemetry.identify({
										userID: this.context.userProfile.shortId,
										intercomHash: this.context.userProfile.intercomHash,
									});
									await this.manager.telemetry.track({
										event: "command:init:identify",
										repository: this.options.repository,
									});

									parentTask.title = `Logged in as ${chalk.cyan(
										this.context.userProfile?.email,
									)}`;
									task.title = "Fetched user profile";
								},
							},
							{
								title: "Fetching user repositories...",
								task: async (_, task) => {
									this.context.userRepositories =
										await this.manager.prismicRepository.readAll();

									task.title = "Fetched user repositories";
								},
							},
						],
						{ concurrent: true },
					);
				},
			},
		]);
	}

	protected useRepositoryFlag(): Promise<void> {
		return listrRun([
			{
				title: `Flag ${chalk.cyan("repository")} used, validating input...`,
				task: async (_, task) => {
					assertExists(
						this.context.userRepositories,
						"User repositories must be available through context to run `useRepositoryFlag`",
					);
					assertExists(
						this.options.repository,
						"Flag `repository` must be set to run `useRepositoryFlag`",
					);

					const domain = formatRepositoryDomain(this.options.repository);

					const maybeRepository = this.context.userRepositories.find(
						(repository) => repository.domain === domain,
					);

					if (maybeRepository) {
						if (
							!this.manager.prismicRepository.hasWriteAccess(maybeRepository)
						) {
							throw new Error(
								`Cannot run init command with repository ${chalk.cyan(
									maybeRepository.domain,
								)}: you are not a developer or admin of this repository`,
							);
						}
					} else {
						const validation = await validateRepositoryDomainAndAvailability({
							domain,
							existsFn: (domain) =>
								this.manager.prismicRepository.checkExists({ domain }),
						});
						const errorMessage = getErrorMessageForRepositoryDomainValidation({
							validation,
							displayDomain: chalk.cyan(domain),
						});

						if (errorMessage) {
							throw new Error(errorMessage);
						}
					}

					task.title = `Selected repository ${chalk.cyan(
						domain,
					)} (flag ${chalk.cyan("repository")} used)`;

					this.context.repository = {
						domain,
						exists: !!maybeRepository,
					};
				},
			},
		]);
	}

	protected async selectRepository(): Promise<void> {
		assertExists(
			this.context.userRepositories,
			"User repositories must be available through context to run `selectRepository`",
		);

		if (this.context.userRepositories.length) {
			await this.trySelectExistingRepository();
		}

		if (!this.context.repository) {
			await this.selectNewRepository();
		}

		assertExists(
			this.context.repository,
			"Repository selection must be available through context to proceed",
		);
		// We prefer to manually allow console logs despite the app being a CLI to catch wild/unwanted console logs better
		// eslint-disable-next-line no-console
		console.log(
			`${logSymbols.success} Selected repository ${chalk.cyan(
				this.context.repository.domain,
			)}`,
		);
	}

	protected async trySelectExistingRepository(): Promise<void> {
		assertExists(
			this.context.userRepositories,
			"User repositories must be available through context to run `trySelectExistingRepository`",
		);

		const { maybeDomain } = await prompt<string, "maybeDomain">({
			type: "select",
			name: "maybeDomain",
			message: "Pick a repository to connect to or choose to create a new one",
			warn: "You are not a developer or admin of this repository",
			choices: [
				{
					title: "CREATE NEW",
					description: "Create a new Prismic repository\n",
					value: "",
				},
				...this.context.userRepositories
					.map((repository) => {
						const hasWriteAccess =
							this.manager.prismicRepository.hasWriteAccess(repository);

						return {
							title: `${repository.domain}${
								hasWriteAccess ? "" : " (Unauthorized)"
							}`,
							description: `Connect to ${chalk.cyan(repository.domain)}`,
							value: repository.domain,
							disabled: !hasWriteAccess,
						};
					})
					.sort((a, b) => (a.value > b.value ? 1 : -1)),
			],
		});

		if (maybeDomain) {
			this.context.repository = {
				domain: maybeDomain,
				exists: true,
			};
		}
	}

	protected async selectNewRepository(): Promise<void> {
		let suggestedName = "";

		// TODO: Improve concurrency
		const trySuggestName = async (name: string): Promise<string | void> => {
			if (name) {
				const formattedName = formatRepositoryDomain(name);

				if (
					!validateRepositoryDomain({ domain: formattedName }).hasErrors &&
					!(await this.manager.prismicRepository.checkExists({
						domain: formattedName,
					}))
				) {
					return formattedName;
				}
			}
		};

		// 1. Try to suggest name after package name
		try {
			const pkgJSONPath = path.join(this.manager.cwd, "package.json");
			const pkg = JSON.parse(await fs.readFile(pkgJSONPath, "utf-8"));

			const maybeSuggestion = await trySuggestName(pkg.name);
			if (maybeSuggestion) {
				suggestedName = maybeSuggestion;
			}
		} catch {
			// Noop
		}

		// 2. Try to suggest name after directory name
		if (!suggestedName) {
			const maybeSuggestion = await trySuggestName(
				path.basename(this.manager.cwd),
			);
			if (maybeSuggestion) {
				suggestedName = maybeSuggestion;
			}
		}

		// 3. Use random name
		if (!suggestedName) {
			do {
				suggestedName = getRandomRepositoryDomain();
			} while (
				await this.manager.prismicRepository.checkExists({
					domain: suggestedName,
				})
			);
		}

		const { domain } = await prompt<string, "domain">({
			type: "text",
			name: "domain",
			// Overriden by the `onRender` function, just used as a fallback
			message: "Choose a name for your Prismic repository",
			initial: suggestedName,
			onRender() {
				const rawDomain = this.value || this.initial || "";
				const domain = formatRepositoryDomain(rawDomain);
				const validation = validateRepositoryDomain({ domain });

				const minRule = validation.LessThan4
					? chalk.red(
							`1. Name must be ${chalk.bold("4 characters long or more")}`,
					  )
					: `1. Name must be ${chalk.cyan("4 characters long or more")}`;

				const maxRule = validation.MoreThan30
					? chalk.red(
							`1. Name must be ${chalk.bold("30 characters long or less")}`,
					  )
					: `1. Name must be ${chalk.cyan("30 characters long or less")}`;

				this.msg = chalk.reset(
					`
Choose a name for your Prismic repository

  NAMING RULES
    ${minRule}
    ${maxRule}
    3. Name will be ${chalk.cyan("kebab-cased")} automatically

  CONSIDERATIONS
    1. Once picked, your repository name ${chalk.cyan("cannot be changed")}
    2. A ${chalk.cyan(
			"display name",
		)} for the repository can be configured later on

  PREVIEW
    Dashboard  ${chalk.cyan(`https://${domain}.prismic.io`)}
    API        ${chalk.cyan(`https://${domain}.cdn.prismic.io/api/v2`)}

${chalk.cyan("?")} Your Prismic repository name`.replace("\n", ""),
				);
			},
			validate: async (rawDomain: string) => {
				const domain = formatRepositoryDomain(rawDomain);
				const validation = await validateRepositoryDomainAndAvailability({
					domain,
					existsFn: (domain) =>
						this.manager.prismicRepository.checkExists({ domain }),
				});
				const errorMessage = getErrorMessageForRepositoryDomainValidation({
					validation,
					displayDomain: chalk.cyan(domain),
				});

				return errorMessage || true;
			},
			format: (value) => {
				return formatRepositoryDomain(value);
			},
		});

		// Clear extra lines
		process.stdout.moveCursor?.(0, -16);
		process.stdout.clearScreenDown?.();

		this.context.repository = {
			domain,
			exists: false,
		};
	}

	protected createNewRepository(): Promise<void> {
		assertExists(
			this.context.repository,
			"Repository selection must be available through context to run `createNewRepository`",
		);

		return listrRun([
			{
				title: `Creating new repository ${chalk.cyan(
					this.context.repository.domain,
				)} ...`,
				task: async (_, task) => {
					assertExists(
						this.context.repository,
						"Repository selection must be available through context to run `createNewRepository`",
					);
					assertExists(
						this.context.framework,
						"Project framework must be available through context to run `createNewRepository`",
					);

					await this.manager.prismicRepository.create({
						domain: this.context.repository.domain,
						framework: this.context.framework.prismicName,
					});

					this.context.repository.exists = true;
					task.title = `Created new repository ${chalk.cyan(
						this.context.repository.domain,
					)}`;
				},
			},
		]);
	}

	protected finishCoreDependenciesInstallation(): Promise<void> {
		return listrRun([
			{
				title: `Finishing core dependencies installation with ${chalk.cyan(
					this.context.packageManager,
				)} ...`,
				task: async (_, task) => {
					assertExists(
						this.context.installProcess,
						"Initial dependencies installation process must be available through context to run `finishCoreDependenciesInstallation`",
					);

					const updateOutput = (data: Buffer | null) => {
						if (data instanceof Buffer) {
							task.output = data.toString();
						}
					};

					// Don't clutter console with logs when process is non TTY (CI, etc.)
					if (process.stdout.isTTY || process.env.NODE_ENV === "test") {
						this.context.installProcess.stdout?.on("data", updateOutput);
					}
					this.context.installProcess.stderr?.on("data", updateOutput);

					try {
						await this.context.installProcess;
					} catch (error) {
						/**
						 * Error catching happens when then process is started ealier so
						 * that all install errors, earlier and presents, can be catched.
						 *
						 * Here, we force the task to wait so that it is neither marked as
						 * done or has the opportunity to handle the error itself.
						 */
						// If for whatever reason the process is not exited by now, we still throw the error
						await new Promise((resolve) => setTimeout(resolve, 5000));
						throw error;
					}

					task.title = `Installed core dependencies with ${chalk.cyan(
						this.context.packageManager,
					)}`;
				},
			},
		]);
	}

	protected upsertSliceMachineConfigurationAndStartPluginRunner(): Promise<void> {
		return listrRun([
			{
				title: "Resolving Slice Machine configuration...",
				task: async (_, parentTask) => {
					assertExists(
						this.context.framework,
						"Project framework must be available through context to run `upsertSliceMachineConfiguration`",
					);
					assertExists(
						this.context.repository,
						"Repository selection must be available through context to run `upsertSliceMachineConfiguration`",
					);

					let sliceMachineConfigExists = false;
					try {
						await this.manager.project.getSliceMachineConfigPath();
						sliceMachineConfigExists = true;
					} catch {
						// noop, config does not exists, we'll create it
					}

					if (sliceMachineConfigExists) {
						parentTask.title = "Updating Slice Machine configuration...";

						const config = await this.manager.project.getSliceMachineConfig();
						await this.manager.project.writeSliceMachineConfig({
							config: {
								...config,
								repositoryName: this.context.repository.domain,
								adapter: this.context.framework.adapterName,
							},
						});
						parentTask.title = "Updated Slice Machine configuration";
					} else {
						parentTask.title = "Creating Slice Machine configuration...";

						const sliceMachineConfigPath =
							await this.manager.project.suggestSliceMachineConfigPath();

						await this.manager.project.writeSliceMachineConfig({
							config: {
								// TODO: Update _latest to a real value or make it optional
								_latest: "legacy",
								repositoryName: this.context.repository.domain,
								adapter: this.context.framework.adapterName,
								libraries: ["./slices"],
							},
							path: sliceMachineConfigPath,
						});

						parentTask.title = "Created Slice Machine configuration";
					}

					return listr([
						{
							title: "Starting plugin runner...",
							task: async (_, task) => {
								await this.manager.plugins.initPlugins();
								task.title = "Started plugin runner";
								parentTask.title = `${parentTask.title} and started plugin runner`;
							},
						},
					]);
				},
			},
		]);
	}

	protected pushDataToPrismic(): Promise<void> {
		return listrRun([
			{
				title: "Pushing data to Prismic...",
				task: (_, parentTask) =>
					listr([
						{
							title: "Pushing slices...",
							skip: () => {
								if (!this.options.push) {
									return `--no-push used`;
								} else if (!this.options.pushSlices) {
									return `--no-push-slices used`;
								}
							},
							task: async (_, task) => {
								const { libraries, errors } =
									await this.manager.slices.readAllSliceLibraries();

								if (errors.length > 0) {
									// TODO: Provide better error message.
									throw new Error(
										`Failed to read slice libraries: ${errors.join(", ")}`,
									);
								}

								const slices: { libraryID: string; sliceID: string }[] = [];
								for (const library of libraries) {
									if (library.sliceIDs) {
										for (const sliceID of library.sliceIDs) {
											slices.push({
												libraryID: library.libraryID,
												sliceID,
											});
										}
									}
								}

								if (slices.length === 0) {
									task.skip("No slice to push");

									return;
								}

								let pushed = 0;
								task.title = `Pushing slices... (0/${slices.length})`;
								await Promise.all(
									slices.map(async (slice) => {
										await this.manager.slices.pushSlice(slice);
										pushed++;
										task.title = `Pushing slices... (${pushed}/${slices.length})`;
									}),
								);

								task.title = "Pushed all slices";
							},
						},
						{
							title: "Pushing custom types...",
							skip: () => {
								if (!this.options.push) {
									return `--no-push used`;
								} else if (!this.options.pushCustomTypes) {
									return `--no-push-custom-types used`;
								}
							},
							task: async (_, task) => {
								const { ids, errors } =
									await this.manager.customTypes.readCustomTypeLibrary();

								if (errors.length > 0) {
									// TODO: Provide better error message.
									throw new Error(
										`Failed to read custom type libraries: ${errors.join(
											", ",
										)}`,
									);
								}

								if (!ids || ids.length === 0) {
									task.skip("No custom type to push");

									return;
								}

								let pushed = 0;
								task.title = `Pushing custom types... (0/${ids.length})`;
								await Promise.all(
									ids.map(async (id) => {
										await this.manager.customTypes.pushCustomType({ id });
										pushed++;
										task.title = `Pushing custom types... (${pushed}/${ids.length})`;
									}),
								);

								task.title = "Pushed all custom types";
							},
						},
						{
							title: "Pushing documents...",
							skip: () => {
								if (!this.options.push) {
									return `--no-push used`;
								} else if (!this.options.pushDocuments) {
									return `--no-push-documents used`;
								}
							},
							task: async (_, task) => {
								assertExists(
									this.context.repository,
									"Repository selection must be available through context to run `pushDataToPrismic`",
								);

								const root = await this.manager.project.getRoot();
								const documentsDirectoryPath = path.resolve(root, "documents");

								try {
									await fs.access(documentsDirectoryPath);
								} catch {
									parentTask.title = "Pushed data to Prismic";
									task.skip("No document to push");

									return;
								}

								const signaturePath = path.resolve(
									documentsDirectoryPath,
									"index.json",
								);
								const rawSignature = await fs.readFile(signaturePath, "utf-8");
								const signature: string = JSON.parse(rawSignature).signature;

								const documentsGlob = await globby("*/*.json", {
									cwd: documentsDirectoryPath,
								});
								if (documentsGlob.length === 0) {
									parentTask.title = "Pushed data to Prismic";
									task.skip("No document to push");

									return;
								}

								const documents: [string, unknown][] = await Promise.all(
									documentsGlob.map(async (document) => {
										const filename = path.basename(document, ".json");
										const fileContent = await fs.readFile(
											path.resolve(documentsDirectoryPath, document),
											"utf-8",
										);

										return [filename, JSON.parse(fileContent)];
									}),
								);

								await this.manager.prismicRepository.pushDocuments({
									domain: this.context.repository.domain,
									documents: Object.fromEntries(documents),
									signature,
								});

								task.title = "Pushed all documents";
								parentTask.title = "Pushed data to Prismic";
							},
						},
						{
							title: "Cleaning up data push artifacts",
							task: async (_, task) => {
								const root = await this.manager.project.getRoot();
								const documentsDirectoryPath = path.resolve(root, "documents");
								try {
									await fs.rm(documentsDirectoryPath, {
										force: true,
										recursive: true,
									});
								} catch {
									// Noop, it's not that big of a deal if we cannot delete this directory
								}

								task.title = "Cleaned up data push artifacts";
								parentTask.title = "Pushed data to Prismic";
							},
						},
					]),
			},
		]);
	}

	protected initializeProject(): Promise<void> {
		return listrRun([
			{
				title: "Initializing project...",
				task: async (_, parentTask) =>
					// We return another Listr instance in the event we have additional task to perform to initialize the project
					listr([
						{
							title: `Patching ${chalk.cyan("package.json")} scripts...`,
							task: async (_, task) => {
								const pkgPath = path.join(this.manager.cwd, "package.json");

								try {
									const pkgRaw = await fs.readFile(pkgPath, "utf-8");
									const pkg = JSON.parse(pkgRaw);

									pkg.scripts ||= {};

									if (!pkg.scripts[START_SCRIPT_KEY]) {
										pkg.scripts[START_SCRIPT_KEY] = START_SCRIPT_VALUE;

										// Cheap indent detection based on https://github.com/sindresorhus/detect-indent (simplified because we're only dealing with JSON here)
										const firstIndent = pkgRaw
											.split("\n")
											.find((line) => line.match(/^(?:( )+|\t+)/));
										const indent = firstIndent?.match(/^(?:( )+|\t+)/)?.[0];

										await fs.writeFile(
											pkgPath,
											JSON.stringify(
												pkg,
												null,
												indent && indent !== " " ? indent : "  ",
											),
										);
									} else if (
										!pkg.scripts["slicemachine"].startsWith(START_SCRIPT_VALUE)
									) {
										throw new Error("Script already exists");
									}
								} catch (error) {
									task.title = `Could not patch ${chalk.cyan(
										"package.json",
									)} scripts (warning)`;
									parentTask.title = `Initialized project (could not patch ${chalk.cyan(
										"package.json",
									)} scripts)`;

									return;
								}

								this.context.projectInitialization ||= {};
								this.context.projectInitialization.patchedScript = true;

								task.title = `Patched ${chalk.cyan("package.json")} scripts`;
								parentTask.title = `Initialized project (patched ${chalk.cyan(
									"package.json",
								)} scripts)`;
							},
						},
					]),
			},
		]);
	}

	protected initializePlugins(): Promise<void> {
		return listrRun([
			{
				title: "Initializing plugins...",
				task: async (_, task) => {
					const updateOutput = (data: Buffer | string | null) => {
						if (data instanceof Buffer) {
							task.output = data.toString();
						} else if (typeof data === "string") {
							task.output = data;
						}
					};

					// TODO: init hook
					const { errors } = await this.manager.plugins.dangerouslyCallHook(
						"command:init",
						{
							log: updateOutput,
							installDependencies: async (args) => {
								assertExists(
									this.context.packageManager,
									"Project package manager must be available through context to run `initializePlugins`",
								);

								try {
									const { execaProcess } = await installDependencies({
										...args,
										agent: this.context.packageManager,
									});

									// Don't clutter console with logs when process is non TTY (CI, etc.)
									if (process.stdout.isTTY || process.env.NODE_ENV === "test") {
										execaProcess.stdout?.on("data", updateOutput);
									}
									execaProcess.stderr?.on("data", updateOutput);

									await execaProcess;
								} catch (error) {
									if (
										error instanceof Error &&
										"shortMessage" in error &&
										"stderr" in error
									) {
										throw new Error(
											`\n\n${error.shortMessage}\n${error.stderr}\n\n${logSymbols.error} Plugins dependency installation failed`,
											{ cause: error },
										);
									}

									throw error;
								}
							},
						},
					);

					if (errors.length > 0) {
						// TODO: Provide better error message.
						throw new Error(
							`Failed to initialize plugins: ${errors.join(", ")}`,
						);
					}

					task.title = "Initialized plugins";
				},
			},
		]);
	}
}