import { Button } from "./Button";

interface Props {

    title: string;

    subtitle?: string;

    buttonText?: string;

    onButtonClick?: () => void;

}

export function PageHeader({

    title,

    subtitle,

    buttonText,

    onButtonClick,

}: Props) {

    return (

        <div className="flex items-center justify-between">

            <div>

                <h1 className="text-3xl font-bold">

                    {title}

                </h1>

                {subtitle && (

                    <p className="text-gray-500 mt-1">

                        {subtitle}

                    </p>

                )}

            </div>

            {buttonText && (

                <Button
                    onClick={onButtonClick}
                    className="bg-orange-500 hover:bg-orange-600"
                >

                    {buttonText}

                </Button>

            )}

        </div>

    );

}