import type { FC, SVGProps } from "react";

export const Syncing: FC<SVGProps<SVGSVGElement>> = (props) => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M4.43868 8.23554L5.06668 7.9405L5.01013 7.24895C5.00343 7.16706 5 7.08404 5 7C5 5.34315 6.34315 4 8 4C9.20763 4 10.2507 4.71358 10.7266 5.7464L11.1628 6.69299L12.0905 6.21805C12.3622 6.07893 12.6704 6 13 6C14.1046 6 15 6.89543 15 8C15 8.03818 14.9989 8.07605 14.9969 8.1136L14.9552 8.86338L15.6636 9.11245C16.4434 9.38659 17 10.1296 17 11C17 12.1046 16.1046 13 15 13V14C16.6569 14 18 12.6569 18 11C18 9.69203 17.163 8.57956 15.9953 8.16905C15.9984 8.1131 16 8.05673 16 8C16 6.34315 14.6569 5 13 5C12.5961 5 12.2108 5.07982 11.8591 5.22454C11.7827 5.25599 11.7079 5.29049 11.6348 5.32791C11.5887 5.22784 11.5386 5.13 11.4847 5.03459C10.7981 3.81994 9.4948 3 8 3C5.79086 3 4 4.79086 4 7C4 7.11127 4.00454 7.22148 4.01346 7.33046C2.82373 7.88942 2 9.09851 2 10.5C2 12.2632 3.30385 13.7219 5 13.9646V12.95C3.85888 12.7184 3 11.7095 3 10.5C3 9.50045 3.58659 8.63588 4.43868 8.23554Z"
      fill="#6F6E77"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M10 9.79289L13.3536 13.1464L12.6464 13.8536L10.5 11.7071V17.5H9.5V11.7071L7.35355 13.8536L6.64645 13.1464L10 9.79289Z"
      fill="#6F6E77"
    />
  </svg>
);
