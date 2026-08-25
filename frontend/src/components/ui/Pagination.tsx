interface PaginationProps {

    page: number;

    totalPages: number;

    onPageChange: (page: number) => void;

}

export function Pagination({

    page,

    totalPages,

    onPageChange,

}: PaginationProps) {

    return (

        <div className="flex justify-end items-center gap-2 mt-6">

            <button

                disabled={page === 1}

                onClick={() => onPageChange(page - 1)}

                className="px-3 py-2 rounded border"

            >

                ←

            </button>

            {

                Array.from({

                    length: totalPages,

                }).map((_, index) => (

                    <button

                        key={index}

                        onClick={() => onPageChange(index + 1)}

                        className={`px-3 py-2 rounded ${page === index + 1
                                ? "bg-orange-500 text-white"
                                : "border"
                            }`}

                    >

                        {index + 1}

                    </button>

                ))

            }

            <button

                disabled={page === totalPages}

                onClick={() => onPageChange(page + 1)}

                className="px-3 py-2 rounded border"

            >

                →

            </button>

        </div>

    );

}