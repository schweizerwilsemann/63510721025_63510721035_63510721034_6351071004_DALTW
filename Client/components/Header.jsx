import React from "react";
import { Button, Navbar, TextInput } from "flowbite-react";
import { Link, useLocation } from "react-router-dom";
import { AiOutlineSearch } from "react-icons/ai";
import { FaMoon, FaSun } from "react-icons/fa";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faShoppingCart } from "@fortawesome/free-solid-svg-icons";

export default function Header() {
  const path = useLocation().pathname;

  const handleSubmit = (e) => {
    e.preventDefault();
  };
  return (
    <Navbar className="border-b-2 ">
      <Link
        to="/"
        className="self-center whitespace-nowrap text-sm 
            sm:text-xl font-semibold dark:text-white"
      >
        <span
          className="ml-0 px-5 py-4 bg-gradient-to-r from-rose-400
                via-orange-300 to bg-yellow-100 text-purple-600"
        >
          ユニクロ
        </span>
        E-Commerce
      </Link>
      <form
        onSubmit={handleSubmit}
        className="flex-grow max-w-md sm:max-w-lg lg:max-w-xl mx-auto"
      >
        <TextInput
          type="text"
          placeholder="Search something...."
          rightIcon={AiOutlineSearch}
          className="hidden lg:inline"
        />
      </form>

      <div className="flex gap-2 md:order-2">
        <Button className="w-12 h-10 hidden sm:inline ml-3" color="red" pill>
          <FaSun />
        </Button>
        <Link to="/sign-in">
          <Button gradientDuoTone="redToYellow">Sign In</Button>
        </Link>
        <Link to="/shopping-cart">
          <Button className="flex items-center gap-1" color="red" pill>
            Cart -
            <FontAwesomeIcon className="mt-1" icon={faShoppingCart} />
          </Button>
        </Link>

        <Navbar.Toggle className="text-white bg-orange-400 hover:bg-orange-500" />
      </div>
      <Navbar.Collapse>
        <Navbar.Link active={path === "/"} as={"div"}>
          <Link to="/">Home</Link>
        </Navbar.Link>
        <Navbar.Link active={path === "/about"} as={"div"}>
          <Link to="/about">About</Link>
        </Navbar.Link>
        <Navbar.Link active={path === "/projects"} as={"div"}>
          <Link to="/projects">Projects</Link>
        </Navbar.Link>
      </Navbar.Collapse>
    </Navbar>
  );
}
