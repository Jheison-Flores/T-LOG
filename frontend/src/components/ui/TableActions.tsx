import {

    Eye,

    Pencil,

    Trash2,

} from "lucide-react";

interface TableActionsProps {

    onView?: () => void;

    onEdit?: () => void;

    onDelete?: () => void;

}

export function TableActions({

    onView,

    onEdit,

    onDelete,

}: TableActionsProps) {

    return (

        <div className="flex gap-2 justify-center">

            {

                onView && (

                    <button

                        onClick={onView}

                        className="text-blue-600"

                    >

                        <Eye size={18} />

                    </button>

                )

            }

            {

                onEdit && (

                    <button

                        onClick={onEdit}

                        className="text-orange-500"

                    >

                        <Pencil size={18} />

                    </button>

                )

            }

            {

                onDelete && (

                    <button

                        onClick={onDelete}

                        className="text-red-600"

                    >

                        <Trash2 size={18} />

                    </button>

                )

            }

        </div>

    );

}