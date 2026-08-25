import type { LucideIcon } from "lucide-react";

interface Props {

    title: string;

    value: string | number;

    icon: LucideIcon;

    color: string;

}

export function KpiCard({

    title,

    value,

    icon: Icon,

    color,

}: Props) {

    return (

        <div
            className="
            bg-white
            rounded-2xl
            shadow-sm
            hover:shadow-lg
            transition-all
            duration-300
            border
            border-gray-100
            p-6
            "
        >

            <div className="flex justify-between items-center">

                <div>

                    <p className="text-gray-500 text-sm">

                        {title}

                    </p>

                    <h2 className="text-4xl font-bold mt-2">

                        {value}

                    </h2>

                </div>

                <div
                    className={`${color}
                    w-16
                    h-16
                    rounded-2xl
                    flex
                    items-center
                    justify-center
                    text-white`}
                >

                    <Icon size={30} />

                </div>

            </div>

        </div>

    );

}