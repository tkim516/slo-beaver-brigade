"use client";
import { useState } from "react";
import Link from "next/link";
import styles from "@styles/navbar/navbar.module.css";
import { HamburgerIcon, Search2Icon, StarIcon } from "@chakra-ui/icons";
import Image from "next/image";
import { SignOutButton } from "@clerk/clerk-react";

export default function Navbar(props: { name: string }) {
  const [showNavbar, setShowNavbar] = useState(false);

  const handleShowNavbar = () => {
    setShowNavbar(!showNavbar);
  };

  /** Changed Beaver Logo to route to /login instead of / 
   * Changed page names and links to Dashboard, Calendar, Profile, Hours,
  */
   
  return (
    <nav className={`${styles.navbar} ${showNavbar && styles.active}`}>
      <div className={styles.container}>
        <div className={`${styles.nav_left} ${showNavbar && styles.active}`}>
          <Link href="/login">
            <Image
              className={styles.logo}
              src={"beaver-logo.svg"}
              alt="Beaver Logo"
              width={35}
              height={35}
            ></Image>
          </Link>
          {(props.name === "Sign In / Log In")? 
            <div className={styles.greeting}>
              <Link href={"/login"}>
                {props.name}
              </Link>
            </div>
          :
            <div className={styles.greeting}>
              <p>{props.name}</p>
            </div>
          }

        </div>
        <div className={`${styles.menu_icon} ${showNavbar && styles.active}`} onClick={handleShowNavbar}>
          <HamburgerIcon /> 
        </div>
        <div
          className={`${styles.nav_elements}  ${showNavbar && styles.active}`}
        >
          <ul>
            <li>
              <Link href="/dashboard/events">
                Dashboard
              </Link>
            </li>
            <li>
              <Link href="/calendar">
                Calendar
              </Link>
            </li>
            <li>
              <Link href="/dashboard/profile">
                Profile
              </Link>
            </li>
            <li>
              <Link href="/dashboard/volunteer">
                Volunteer
              </Link>
            </li>
            {(props.name != "Sign In / Log In") &&
          <>
            <li>
              <Link href="/">My Account</Link>
            </li>
            <li>
                <SignOutButton />
            </li>
            </>
          }
            <li>
              <Link href="https://www.slobeaverbrigade.com/">
                Back to Homepage
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}
