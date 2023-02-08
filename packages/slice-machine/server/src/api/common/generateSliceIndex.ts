import path from "path";
import { Models } from "@slicemachine/core";
import { BackendEnvironment } from "../../../../lib/models/common/Environment";
import Files from "../../../../lib/utils/files";
import { findIndexFile } from "../../../../lib/utils/lib";

const CODE_GENERATED_COMMENT = `// Code generated by Slice Machine. DO NOT EDIT.\n`;

const createIndexFile = (lib: Models.Library<Models.Component>) => {
  const { imports, exportList, componentsProperties } = lib.components.reduce(
    (
      acc: {
        imports: string;
        exportList: string;
        componentsProperties: string;
      },
      component
    ) => {
      const imports =
        acc.imports +
        `import ${component.model.name} from './${component.model.name}';\n`;
      const exportList = acc.exportList + `\t${component.model.name},\n`;
      const componentsProperties =
        acc.componentsProperties +
        `\t${component.model.id}: ${component.model.name},\n`;

      return { imports, exportList, componentsProperties };
    },
    { imports: "", exportList: "", componentsProperties: "" }
  );

  const exports = `export {\n${exportList}};\n`;
  const components = `export const components = {\n${componentsProperties}};\n`;

  return [CODE_GENERATED_COMMENT, imports, exports, components].join("\n");
};

const createIndexFileForSvelte = (lib: Models.Library<Models.Component>) => {
  let f = `${CODE_GENERATED_COMMENT}\n`;
  f += "const Slices = {}\n";
  f += "export default Slices\n\n";

  for (const c of lib.components) {
    f += `import ${c.model.name} from './${c.model.name}/index.svelte'\n`;
    f += `Slices.${c.model.name} = ${c.model.name}\n`;
  }
  return f;
};

const createIndexFileForFrameWork = (
  library: Models.Library<Models.Component>,
  framework: BackendEnvironment["framework"]
) => {
  if (framework === Models.Frameworks.svelte)
    return createIndexFileForSvelte(library);
  return createIndexFile(library);
};

export default function generateSliceIndex(
  library: Models.Library<Models.Component>,
  cwd: BackendEnvironment["cwd"],
  framework: BackendEnvironment["framework"]
) {
  if (library.components.length) {
    const { pathToSlice: relativePathToLib } = library.components[0];
    const file = createIndexFileForFrameWork(library, framework);

    const pathToLib = path.join(cwd, relativePathToLib);

    const indexFilePath = (() => {
      const fromPathToLib = findIndexFile(pathToLib);
      if (fromPathToLib !== null) {
        return fromPathToLib;
      }
      return path.join(pathToLib, "index.js");
    })();

    Files.write(indexFilePath, file);
  }
}
