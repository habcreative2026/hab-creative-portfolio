"use client"

import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { useLanguage } from "../i18n/LanguageContext";

export default function AboutPage() {
    const { t } = useLanguage()

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
        <div className="min-h-screen pt-24 md:pt-40">

            <section className="relative pt-10 md:pt-20">

                <div className="sticky top-0 min-h-screen md:h-screen grid grid-cols-1 md:grid-cols-2 items-start gap-10 md:gap-0">

                    <div className="relative z-20 flex flex-col justify-between h-auto md:h-[450px] px-4 md:px-0">

                        <motion.h1
                            style={{ y: titleY }}
                            className="font-bold tracking-tight leading-none text-[52px] sm:text-[80px] md:text-[160px]"
                        >
                            <div className="flex items-center flex-wrap">
                                <span>QUI</span>

                                <span className="flex-1 mx-2 md:mx-5 min-w-auto">
                                    <span>BUI</span>
                                </span>
                            </div>
                        </motion.h1>

                        <motion.div
                            style={{ y: textY }}
                            className="max-w-full bg-white px-0 md:px-4 mt-6 md:mt-0"
                        >
                            <p className="text-xs text-gray-400">{t.about}</p>

                            <p
                                className="text-[16px] sm:text-[20px] md:text-[24px] leading-relaxed font-semibold mt-2 md:-mt-4"
                                style={{
                                    textIndent: window.innerWidth >= 768 ? "100px" : "0px"
                                }}
                            >
                                {t.about1}
                            </p>
                        </motion.div>

                    </div>

                    <div className="relative z-10 flex justify-end px-4 md:px-0">

                        <img
                            src="/bhq.jpg"
                            className="w-full md:w-[680px] h-[280px] sm:h-[420px] md:h-[440px] object-cover"
                            alt=""
                        />

                        <motion.div
                            style={{ y: textY }}
                            className="absolute bottom-4 right-8 md:right-4 z-30 mix-blend-difference text-white text-[16px] md:text-[24px] whitespace-nowrap"
                        >
                            2019 — {t.about2}
                        </motion.div>

                    </div>

                </div>

            </section>


            <div className="px-4 -pt-24 -mt-24">
                <motion.section
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 0.6 }}
                >

                    <div className="grid grid-cols-1 md:grid-cols-[40%_20%_20%_20%] mb-6 md:mb-2">
                        <h2 className="md:col-start-2 text-3xl md:text-5xl font-semibold mb-6 md:mb-14">
                            {t.about3}
                        </h2>
                    </div>

                    <div className="hidden md:grid grid-cols-[40%_20%_20%_20%] text-xs font-semibold text-gray-400 mb-2">
                        <div>{t.position}</div>
                        <div>{t.type}</div>
                        <div>Company</div>
                        <div>{t.year}</div>
                    </div>

                    <div className="space-y-4 text-[18px] md:text-[24px] font-semibold">

                        <div className="grid grid-cols-1 md:grid-cols-[40%_20%_20%_20%] border-t py-4 gap-2 md:gap-0">
                            <div>{t.ex1}</div>
                            <div className="text-sm md:text-[24px] text-gray-500 md:text-black">{t.ex3}</div>
                            <div className="text-sm md:text-[24px] text-gray-500 md:text-black">HAB Creative</div>
                            <div className="text-sm md:text-[24px] text-gray-500 md:text-black">2025 — {t.year1}</div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-[40%_20%_20%_20%] border-t py-4 gap-2 md:gap-0">
                            <div>{t.ex2}</div>
                            <div className="text-sm md:text-[24px] text-gray-500 md:text-black">{t.ex3}</div>
                            <div className="text-sm md:text-[24px] text-gray-500 md:text-black">Dong Tay Land</div>
                            <div className="text-sm md:text-[24px] text-gray-500 md:text-black">2021 — 2024</div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-[40%_20%_20%_20%] border-t py-4 gap-2 md:gap-0">
                            <div>{t.ex2}</div>
                            <div className="text-sm md:text-[24px] text-gray-500 md:text-black">{t.ex3}</div>
                            <div className="text-sm md:text-[24px] text-gray-500 md:text-black">Alpha Creative</div>
                            <div className="text-sm md:text-[24px] text-gray-500 md:text-black">2019 — 2021</div>
                        </div>

                    </div>
                </motion.section>

                <motion.section
                    className="mt-14 pt-14"
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 0.6 }}
                >

                    <h2 className="text-3xl md:text-5xl mb-10 md:mb-14 font-semibold">
                        {t.ar}
                    </h2>

                    <div className="hidden md:grid grid-cols-[30%_50%_10%] text-xs font-semibold text-gray-400 mb-2">
                        <div>{t.a1}</div>
                        <div>{t.a2}</div>
                        <div>{t.year}</div>
                    </div>

                    <div className="space-y-4 text-[18px] md:text-[24px] font-semibold mb-20">

                        <div className="grid grid-cols-1 md:grid-cols-[30%_50%_10%] border-t py-4 gap-2 md:gap-0">
                            <div>{t.a1x}</div>
                            <div className="text-sm md:text-[24px] text-gray-500 md:text-black">
                                {t.a2x}
                            </div>
                            <div className="text-sm md:text-[24px] text-gray-500 md:text-black">
                                5/2018
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-[30%_50%_10%] border-t py-4 gap-2 md:gap-0">
                            <div>{t.a1x}</div>
                            <div className="text-sm md:text-[24px] text-gray-500 md:text-black">
                                {t.a3x}
                            </div>
                            <div className="text-sm md:text-[24px] text-gray-500 md:text-black">
                                3/2018
                            </div>
                        </div>

                    </div>
                </motion.section>

            </div>

        </div>
    )
}