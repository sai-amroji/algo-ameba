import { GithubIcon } from "lucide-react";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import { useNavigate } from "react-router-dom";
import { useRef, useEffect } from "react";
import { gsap } from "gsap";
import {Toggle} from "@/components/ui/toggle.tsx";
import {ModeToggle} from "@/components/mode-toggle.tsx";

const LandingPage = () => {
    const navigate = useNavigate();

    const titleRef = useRef(null);
    const cardsRef = useRef([]);
    const buttonRef = useRef(null);
    const buttonBgRef = useRef(null);

    useEffect(() => {
        // Title animation (letter by letter)
        if (titleRef.current) {
            const letters = titleRef.current.querySelectorAll("span");
            gsap.from(letters, {
                opacity: 0,
                y: 50,
                stagger: 0.1,
                duration: 0.6,
                ease: "power3.out",
            });
        }

        // Cards animation (line by line)
        cardsRef.current.forEach((card) => {
            const lines = card.querySelectorAll("h2, div");
            gsap.from(lines, {
                opacity: 0,
                x: -30,
                stagger: 0.2,
                duration: 0.6,
                ease: "power2.out",
            });
        });

        // Get Started button animation
        if (buttonRef.current && buttonBgRef.current) {
            const tl = gsap.timeline();
            tl.from(buttonRef.current, {
                y: -100,
                opacity: 0,
                duration: 0.8,
                ease: "power2.out",
            }).from(
                buttonBgRef.current,
                {
                    x: "-100%",
                    duration: 0.8,
                    ease: "power2.inOut",
                },
                "-=0.5"
            );
        }
    }, []);

    return (
        <div className={"w-full h-full bg-background"}>
            <nav className={"flex w-full justify-end gap-8 p-4 text--primary text-shadow-[8px] backdrop-blur-2xl  font-[audiowide] font-regular text-[24px]"}>
                <ModeToggle />
                <p className="relative cursor-pointer border-b-2 border-transparent hover:border-[#00ff08] transition-all duration-300"
                   onClick={() => navigate("/home")}>
                    Home
                </p>
                <p className="relative cursor-pointer border-b-2 border-transparent hover:border-[#00ff08] transition-all duration-300"
                   onClick={() => navigate("/algorithms")}>
                    Algorithms
                </p>
                <p className="relative cursor-pointer border-b-2 border-transparent hover:border-[#00ff08] transition-all duration-300"
                   onClick={() => navigate("/about")}>
                    About Us
                </p>
            </nav>

            <header className={"flex justify-around items-center w-full p-0 my-20"}>
                <h1
                    ref={titleRef}
                    className={"font-bold font-[audiowide] m-5 translate-x-[100px] text-[160px] text-white text-shadow-[0px_5px_5px_rgb(0,0,0)]"}
                >
                    {"Algo  Ameba".split(" ").map((letter, i) => (
                        <span key={i} className="inline-block">

              {letter}
            </span>
                    ))}
                </h1>
            </header>


            <div className={"flex flex-row justify-around"}>



                <div className={"flex flex-col gap-8 m-10 justify-between"}>
                    {[
                        { title1: "Modern and", title2: "Fluid Animations", text: "Animations which are butter smooth using modern animation GSAP Animate and learn anything" },
                        { title1: "Easy and", title2: "Fast Animations", text: "Animations which are butter smooth using modern animation GSAP Animate and learn anything" },
                    ].map((card, i) => (
                        <div
                            key={i}
                            ref={(el) => (cardsRef.current[i] = el)}
                            className="w-full sm:w-[80%] md:w-[400px] h-auto rounded-3xl shadow-2xl backdrop-blur-2xl border-[3px] border-[#007f04] p-4 gap-4 hover:scale-100 transition ease-in-out duration-300"
                        >
                            <div className="text-3xl text-primary font-[baijamjuri]">
                                <h2>{card.title1}</h2>
                                <h2>{card.title2}</h2>
                            </div>
                            <br />
                            <div className="text-lg text-primary font-[arima] space-y-1 mt-2">
                                <div>{card.text}</div>
                            </div>
                        </div>
                    ))}


                </div>


                <div className={"flex flex-col gap-8 m-10 h-[1000px] justify-around content-center items-center"}>
                    {[

                        { title1: "Simple and", title2: "Complex Animations", text: "Animations which are butter smooth using modern animation GSAP Animate and learn anything" },

                    ].map((card, i) => (
                        <div
                            key={i}
                            ref={(el) => (cardsRef.current[i] = el)}
                            className="w-full sm:w-[80%] md:w-[400px] h-auto rounded-3xl shadow-2xl backdrop-blur-2xl border-[3px] border-[#007f04] p-4 gap-4 hover:scale-105 transition ease-in-out duration-300"
                        >
                            <div className="text-3xl text- font-[baijamjuri]">
                                <h2>{card.title1}</h2>
                                <h2>{card.title2}</h2>
                            </div>
                            <br />
                            <div className="text-lg text-[#ffffff] font-[arima] space-y-1 mt-2">
                                <div>{card.text}</div>
                            </div>
                        </div>
                    ))}
                </div>


            </div>

            <div
                ref={buttonRef}
                className="relative flex justify-center items-center text-2xl text-white font-[arima] gap-4 rounded-full border-2 border-[#007f04] w-[200px] h-[60px] m-auto shadow-2xl overflow-hidden cursor-pointer"
                onClick={() => navigate("/home")}
            >
                <div
                    ref={buttonBgRef}
                    className="absolute inset-0 bg-[#007f04] -z-10"
                ></div>
                <span>Get Started</span>
            </div>

            <footer>

                <div className={" flex justify-around items-center mx-25"}>

                    <div className={"flex flex-col font-semibold font-size-[32px] items-center"}>


                 <span className={"bg-black w-[50px] h-[50px] rounded-[20px] flex justify-center items-center py-2"}>
                     <GithubIcon/>

                 </span>
                        <span className={"text-black"}>Contribute Here</span>

                    </div>


                    <div className={"font-size-[32px] font-semibold flex flex-col items-center"}>


                        <div className="*:data-[slot=avatar]:ring-background flex -space-x-2 *:data-[slot=avatar]:ring-2 *:data-[slot=avatar]:grayscale">
                            <Avatar>
                                <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
                                <AvatarFallback>CN</AvatarFallback>
                            </Avatar>
                            <Avatar>
                                <AvatarImage src="https://github.com/leerob.png" alt="@leerob" />
                                <AvatarFallback>LR</AvatarFallback>
                            </Avatar>
                            <Avatar>
                                <AvatarImage
                                    src="https://github.com/evilrabbit.png"
                                    alt="@evilrabbit"
                                />
                                <AvatarFallback>ER</AvatarFallback>
                            </Avatar>

                        </div>
                        <span className={"text-black"}>

                     Contributers
                 </span>

                    </div>








                </div>
            </footer>
        </div>
    );
};

export default LandingPage;