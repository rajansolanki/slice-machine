import React from "react";

const OpenIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M9.5 9C9.22386 9 9 9.22386 9 9.5V22.4996C9 22.7758 9.22386 22.9996 9.5 22.9996H22.5C22.7761 22.9996 23 22.7758 23 22.4996V17.5C23 17.2239 23.2239 17 23.5 17C23.7761 17 24 17.2239 24 17.5V22.4996C24 23.3281 23.3284 23.9996 22.5 23.9996H9.5C8.67157 23.9996 8 23.3281 8 22.4996V9.5C8 8.67157 8.67157 8 9.5 8H14.5C14.7761 8 15 8.22386 15 8.5C15 8.77614 14.7761 9 14.5 9H9.5ZM24 8H18L20.6464 10.6464L15.6464 15.6464C15.4512 15.8417 15.4512 16.1583 15.6464 16.3536C15.8417 16.5488 16.1583 16.5488 16.3536 16.3536L21.3536 11.3536L24 14V8Z"
        fill="currentColor"
      />
    </svg>
  );
};

export default OpenIcon;
