import {ArrowBigDownDashIcon, ArrowBigLeft, ArrowBigRight, GithubIcon} from "lucide-react";
import {useNavigate} from "react-router-dom";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar.tsx";
import {Separator} from "@/components/ui/separator.tsx";


const LandingPage = () => {






     const navigate = useNavigate();

    return (
        <div className={"w-full h-full bg-[#F5F5F5]"}>

            <nav className={"flex w-full justify-end  p-2 text-lime-400 text-shadow-sm backdrop-blur-2xl  font-[audiowide] font-regular text-[24px]"}>

                <div className="flex justify-between gap-4 text-shadow-[3px_3px_rgb(0,0,0,1)]">

                    <div>
                        Home
                    </div>
                    <div>
                        Algoritms
                    </div>
                    <div>
                        About Us
                    </div>
                </div>


            </nav>

            <header className={"w-full"}>
                <h1 className={"font-bold " +
                    "font-[audiowide] " +
                    "m-5 " +
                    "text-[160px] " +
                    "shadow-inner-[5px_5px_rgb(0,0,0)] " +
                    "text-shadow-[5px_5px_rgb(0,0,0)] text-lime-300"}
                >
                    Algo Ameba
                </h1>
            </header>



            <div className={"flex flex-row justify-around items-between content-around"}>

                <div className="flex flex-col items-between ">

                    <div className={"w-[400px] h-[200px] rounded-xs p-5 text-black shadow-[4px_4px_rgb(0,0,0)]  border-black border-2"}>

                        <div className="font-extrabold pb-4">
                            <h2>Easy</h2>
                            <h2>And</h2>
                            <h3>Fast</h3>
                        </div>
                        <div>
                            <div>User Friendly Experience and very Intuitive to use
                            </div>
                        </div>

                     </div>

                    <div className={"h-[500px]"}>

                    </div>


                     <div className={"w-[400px] h-[200px] rounded-xs p-5 text-black shadow-[4px_4px_rgb(0,0,0)]  border-black border-2"}>

                        <div className="font-extrabold pb-4">
                            <h2>Bars</h2>
                            <h2>To</h2>
                            <h3>Graphs</h3>
                        </div>
                        <div>
                            <div>Imagine Anything from Simple bars Sorting , Searching To Complex Network Graph
                            </div>
                        </div>

                    </div>







                </div>

                <div className="flex flex-col   items-between w-[100px]">

                    <div className="w-[40px] h-[40px] justify-start align-middle items-center content-center bg-lime-300 rounded-xs p-5 text-black shadow-[4px_4px_rgb(0,0,0)]  border-black border-2">
                        <h3>1</h3>
                    </div>
                    <div className={"flex flex-col  items-center justify-center w-[100px] h-[100px] bg-black"}/ >

                    <div className="w-[40px] h-[40px] justify-start align-middle items-center content-center bg-lime-300 rounded-xs p-5 text-black shadow-[4px_4px_rgb(0,0,0)]  border-black border-2">
                        <h3>2</h3>
                    </div>
                    <Separator orientation={"vertical"} color={"black"}/>
                    <div className="w-[40px] h-[40px] justify-start align-middle items-center content-center bg-lime-300 rounded-xs p-5 text-black shadow-[4px_4px_rgb(0,0,0)]  border-black border-2">
                        <h3>3</h3>
                    </div>
                </div>

                <div className="flex flex-col items-center">

                    <div className={"h-[400px]"}>

                    </div>


                    <div className={"w-[400px] h-[200px] rounded-xs p-5 text-black shadow-[4px_4px_rgb(0,0,0)]  border-black border-2"}>

                        <div className="font-extrabold pb-4">
                            <h2>Simple</h2>
                            <h2>To</h2>
                            <h3>Complex Animation</h3>
                        </div>
                        <div>
                            <div>Imagine Simple to
                                Complex Animation with Modern Powerful library With <span className="text-lime-400 font-extrabold">GSAP</span>
                            </div>
                        </div>

                    </div>
                </div>

                <div className={"h-[400px]"}>

                </div>




            </div>


            <footer className={"bg-pink-400 mt-5 pt-5"}>



            <div className="flex flex-col items-center justify-center">



            <span >
                <button onClick={() => navigate("/home")} className={" h-[50px]  px-4 flex gap-2 justify-between color-white items-center bg-green-400 font-bold font-size-[24px] rounded-[20px] shadow-[4px_4px_rgb(0,0,0)] border-2 border-black"}>Get Started <svg xmlns="http://www.w3.org/2000/svg" width="24"  color={"white"} height="24"><path d="M7.293 4.707 14.586 12l-7.293 7.293 1.414 1.414L17.414 12 8.707 3.293 7.293 4.707z"/></svg></button>

            </span>





            </div>

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

    )
}



export  default LandingPage;