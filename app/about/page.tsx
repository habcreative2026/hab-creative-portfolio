"use client"

import { motion, useScroll, useTransform, useSpring } from "framer-motion"

export default function AboutPage() {

    const { scrollY } = useScroll()

    const textYRaw = useTransform(scrollY, [0, 600], [0, -150])
    const textY = useSpring(textYRaw, {
        stiffness: 70,
        damping: 20,
        mass: 0.7 
    })

    const titleYRaw = useTransform(scrollY, [0, 1000], [0, 250])
    const titleY = useSpring(titleYRaw, {
        stiffness: 50,
        damping: 25,
        mass: 1
    })

    return (
        <div className="min-h-screen pt-40">

            <section className="relative pt-20">

                <div className="sticky top-0 h-screen grid grid-cols-2 items-start">


                    <div className="relative z-20 flex flex-col justify-between h-[450px]">

                        <motion.h1
                            style={{ y: titleY }}
                            className="font-bold tracking-tight leading-none text-[160px]"
                        >
                            <div className="flex items-center">
                                <span>QUI</span>
                                <span className="flex-1 mx-5 min-w-auto ">
                                    <span className="">BUI</span>
                                </span>
                                {/* <span>HAI</span> */}
                            </div>
                        </motion.h1>

                        <motion.div
                            style={{ y: textY }}
                            className="max-w-full bg-white px-4"
                        >
                            <p className="text-xs text-gray-400">About</p>

                            <p
                                className="text-[24px] leading-relaxed font-semibold -mt-4"
                                style={{ textIndent: "100px" }}
                            >
                                I’m Qui Bui, a digital product designer and creative developer passionate about shaping experiences at 
                                the crossroads of design and technology. Since 2019, I’ve crafted everything from bold brand identities 
                                to digital platforms.
                            </p>
                        </motion.div>

                    </div>

                    <div className="relative z-10 flex justify-end">

                            <img
                                src="/avt_bhq.jpg" 
                                className="w-[680px] h-[440px] object-cover"
                                alt=""
                            />
                      

                        <motion.div
                            style={{ y: textY }}
                            className="absolute bottom-4 right-4 z-30 mix-blend-difference text-white text-[24px] whitespace-nowrap"
                        >
                            2019 — Today
                        </motion.div>

                    </div>

                </div>

            </section>


            {/* ================= CONTENT (NOW ATTACHED PROPERLY) ================= */}
            <div className="px-4 -pt-24 -mt-24">

                {/* EXPERIENCE */}
                <motion.section
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 0.6 }}
                >
                    <div className="grid grid-cols-[40%_20%_20%_20%] mb-2">
        <h2 className="col-start-2 text-5xl font-semibold mb-14">Experience</h2>
    </div>

                    {/* Column headers */}
                    <div className="grid grid-cols-[40%_20%_20%_20%] text-xs font-semibold text-gray-400 mb-2">
                        <div>Position</div>
                        <div>Type</div>
                        <div>Company</div>
                        <div>Year</div>
                    </div>

                    {/* Experience data */}
                    <div className="space-y-4 text-[24px] font-semibold">
                        <div className="grid grid-cols-[40%_20%_20%_20%] border-t py-3">
                            <div>Founder & Creative Director</div>
                            <div>Full-time</div>
                            <div>HAB Creative</div>
                            <div>2025 — Present</div>
                        </div>
                        {/* <div className="grid grid-cols-[40%_20%_20%_20%] border-t py-3">
                            <div>Design Engineer</div>
                            <div>Full-time</div>
                            <div>Pearlfisher</div>
                            <div>2019 — 2021</div>
                        </div> */}
                        <div className="grid grid-cols-[40%_20%_20%_20%] border-t py-3">
                            <div>Creative Designer</div>
                            <div>Full-time</div>
                            <div>Dong Tay Land</div>
                            <div>2021 — 2024</div>
                        </div>
                        <div className="grid grid-cols-[40%_20%_20%_20%] border-t py-3">
                            <div>Creative Designer</div>
                            <div>Full-time</div>
                            <div>Alpha Creative</div>
                            <div>2019 — 2021</div>
                        </div>
                        {/* <div className="grid grid-cols-[40%_20%_20%_20%] border-t py-3">
                            <div>Junior Web Designer</div>
                            <div>Full-time</div>
                            <div>Pentagram</div>
                            <div>2016 — 2017</div>
                        </div> */}
                    </div>
                </motion.section>

                {/* AWARDS */}
                <motion.section
                    className="mt-14 pt-14"
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 0.6 }}
                >
                    <h2 className="text-5xl mb-14 font-semibold">Awards & Recognition</h2>

                    {/* Column headers */}
                    <div className="grid grid-cols-[30%_50%_10%] text-xs font-semibold text-gray-400 mb-2">
                        <div>Award</div>
                        <div>Nomination</div>
                        <div>Year</div>
                    </div>

                    {/* Award data */}
                    <div className="space-y-4 text-[24px] font-semibold mb-20">
                        <div className="grid grid-cols-[30%_50%_10%] border-t py-3">
                            <div>WorldSkills Vietnam 2018</div>
                            <div>National First Prize – Vietnam WorldSkills Graphic Design.</div>
                            <div>5/2018</div>
                        </div>
                        <div className="grid grid-cols-[30%_50%_10%] border-t py-3">
                            <div>WorldSkills Vietnam 2018</div>
                            <div>1st Prize – WorldSkills Vietnam | MOIT.</div>
                            <div>3/2018</div>
                        </div>
                        {/* <div className="grid grid-cols-[30%_50%_10%] border-t py-3">
                            <div>CSSDA</div>
                            <div>Website of the Day</div>
                            <div>2021</div>
                        </div>
                        <div className="grid grid-cols-[30%_50%_10%] border-t py-3">
                            <div>Awwwards</div>
                            <div>Developer Award</div>
                            <div>2019</div>
                        </div> */}
                    </div>
                </motion.section>

            </div>

        </div>
    )
}