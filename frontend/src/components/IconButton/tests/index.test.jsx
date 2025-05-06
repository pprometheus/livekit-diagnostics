import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { faCoffee } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import IconButton from "..";

test("renders label and calls onClick once when clicked", () => {
  const handleClick = jest.fn();

  render(
    <IconButton
      icon={<FontAwesomeIcon icon={faCoffee} data-testid="icon" />}
      label="Test"
      onClick={handleClick}
    />
  );

  expect(screen.getByText("Test")).toBeInTheDocument();

  fireEvent.click(screen.getByRole("button"));

  expect(handleClick).toHaveBeenCalledTimes(1);
});
