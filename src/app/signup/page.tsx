import { Suspense } from "react";
import SignUp from "./signupComponent";

export default function Page(){
    return (
        <Suspense fallback="Loading..">
            <SignUp/>
        </Suspense>
    )
}