import {GithubIcon} from "lucide-react";
import {AvatarImage} from "@/components/ui/avatar.tsx";
import {Avatar} from "@radix-ui/react-avatar";
import {useNavigate} from "react-router-dom";


const LandingPage = () => {


    return (
        <div className={"w-full h-full bg-background"}>

            <nav className={"flex w-full justify-end p-4 text-[#FFF] text-shadow-[8px] backdrop-blur-2xl  font-[audiowide] font-regular text-[24px]"}>
                <p>
                    Home
                </p>
                <p>
                    Algoritms
                </p>
                <p>
                    About Us
                </p>

            </nav>

            <header className={"w-full "}>
                <h1 className={"font-bold " +
                    "font-[audiowide] " +
                    "m-5 " +
                    "hover:text-orange-green translate-x-190 transition-smooth transition-cubic  " +
                    " text-[160px] " +
                    "text-white shadow-inner-[0px_5px_5px_rgb(0,0,0)] " +
                    "text-shadow-[0px_5px_5px_rgb(0,0,0)]"}
                >
                    Algo Ameba
                </h1>
            </header>

            <div className={"flex flex-col "}>

                <div className={"w-[400px] h-[200px] rounded-xs shadow-2xl backdrop-blur-2xl border-black border-2 border-accent-foreground"}>

                    <div>
                        <h2>Simple</h2>
                        <h2>To</h2>
                        <h3>Complex Animation</h3>
                    </div>
                    <div>
                        <div>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Accusantium aliquam amet
                            blanditiis cum dolor dolore, doloremque ducimus eos, error fuga laboriosam maiores nostrum
                            officiis optio placeat quidem sed sint, tempora.
                        </div>
                    </div>

                </div>
                <div className={"w-[400px] h-[200px] rounded-xs shadow-2xl backdrop-blur-2xl"}>

                    <div>
                        <h2>Simple</h2>
                        <h2>To</h2>
                        <h3>Complex Animation</h3>
                    </div>
                    <div>
                        <div>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Accusantium aliquam amet
                            blanditiis cum dolor dolore, doloremque ducimus eos, error fuga laboriosam maiores nostrum
                            officiis optio placeat quidem sed sint, tempora.
                        </div>
                    </div>

                </div>
                <div className={"w-[400px] h-[200px] rounded-xs shadow-2xl backdrop-blur-2xl"}>

                    <div>
                        <h2>Simple</h2>
                        <h2>To</h2>
                        <h3>Complex Animation</h3>
                    </div>
                    <div>
                        <div>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Accusantium aliquam amet
                            blanditiis cum dolor dolore, doloremque ducimus eos, error fuga laboriosam maiores nostrum
                            officiis optio placeat quidem sed sint, tempora.
                        </div>
                    </div>

                </div>
            </div>
            <span className={"rounded-xs"} onClick={useNavigate("/home")}>
                <button>Get Started</button>
            </span>
            <div>
                <span>
                    <GithubIcon/>
                </span>
                <Avatar>
                    <AvatarImage/>
                </Avatar>
            </div>
        </div>

    )
}



export  default LandingPage;
