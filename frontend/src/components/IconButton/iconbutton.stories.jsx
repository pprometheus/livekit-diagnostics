import React from "react";
import IconButton from ".";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faInfo } from "@fortawesome/free-solid-svg-icons";
const meta = {
  title: "Components/IconButton",
  component: IconButton,
  tags: ["autodocs"],
  argTypes: {
    onClick: { action: "clicked" },
  },
};

export default meta;

export const Default = {
  args: {
    icon: <FontAwesomeIcon icon={faInfo} color="white" />,
    label: "Back",
  },
};
