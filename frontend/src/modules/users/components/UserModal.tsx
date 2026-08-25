import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Building2,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import {
  Modal,
} from "@/components/ui/Modal";

import {
  Button,
} from "@/components/ui/Button";

import {
  Input,
} from "@/components/ui/Input";

import type {
  Role,
} from "@/modules/roles/types/role.types";

import type {
  Warehouse,
} from "@/modules/warehouses/types/warehouse.types";

import type {
  CreateUserDto,
  UpdateUserDto,
  User,
} from "../types/user.types";

interface Props {
  open: boolean;

  user?: User | null;

  roles: Role[];

  warehouses: Warehouse[];

  loading?: boolean;

  onClose: () => void;

  onSubmit: (
    data:
      | CreateUserDto
      | UpdateUserDto,
  ) => void;
}

export function UserModal({
  open,
  user,
  roles,
  warehouses,
  loading = false,
  onClose,
  onSubmit,
}: Props) {
  // ============================================================
  // MODO
  // ============================================================

  const isEditing =
    Boolean(user);

  // ============================================================
  // FORMULARIO
  // ============================================================

  const [
    username,
    setUsername,
  ] = useState("");

  const [
    firstName,
    setFirstName,
  ] = useState("");

  const [
    lastName,
    setLastName,
  ] = useState("");

  const [
    email,
    setEmail,
  ] = useState("");

  const [
    phone,
    setPhone,
  ] = useState("");

  const [
    position,
    setPosition,
  ] = useState("");

  const [
    password,
    setPassword,
  ] = useState("");

  const [
    roleId,
    setRoleId,
  ] = useState("");

  const [
    warehouseId,
    setWarehouseId,
  ] = useState("");

  const [
    error,
    setError,
  ] = useState("");

  // ============================================================
  // ROLES PERMITIDOS EN T-LOG
  // ============================================================

  const activeRoles =
    useMemo(
      () =>
        roles.filter(
          (role) =>
            (
              role.code ===
                "ADMIN" ||
              role.code ===
                "LOGISTICS"
            ) &&
            (
              role.isActive ||
              role.id ===
                user?.role.id
            ),
        ),
      [
        roles,
        user,
      ],
    );

  // ============================================================
  // ALMACENES ACTIVOS
  // ============================================================

  const activeWarehouses =
    useMemo(
      () =>
        warehouses.filter(
          (warehouse) =>
            warehouse.isActive ||
            warehouse.id ===
              user?.warehouse?.id,
        ),
      [
        warehouses,
        user,
      ],
    );

  // ============================================================
  // ROL SELECCIONADO
  // ============================================================

  const selectedRole =
    activeRoles.find(
      (role) =>
        role.id ===
        Number(roleId),
    );

  const selectedRoleCode =
    selectedRole?.code;

  const isAdminRole =
    selectedRoleCode ===
    "ADMIN";

  const isLogisticsRole =
    selectedRoleCode ===
    "LOGISTICS";

  // ============================================================
  // CARGAR DATOS
  // ============================================================

  useEffect(() => {
    if (!open) {
      return;
    }

    if (user) {
      setUsername(
        user.username,
      );

      setFirstName(
        user.firstName,
      );

      setLastName(
        user.lastName,
      );

      setEmail(
        user.email,
      );

      setPhone(
        user.phone ??
          "",
      );

      setPosition(
        user.position ??
          "",
      );

      /*
       * Nunca cargamos la contraseña
       * actual al formulario.
       */
      setPassword("");

      setRoleId(
        String(
          user.role.id,
        ),
      );

      setWarehouseId(
        user.warehouse
          ? String(
              user.warehouse.id,
            )
          : "",
      );
    } else {
      setUsername("");
      setFirstName("");
      setLastName("");
      setEmail("");
      setPhone("");
      setPosition("");
      setPassword("");
      setRoleId("");
      setWarehouseId("");
    }

    setError("");
  }, [
    open,
    user,
  ]);

  if (!open) {
    return null;
  }

  // ============================================================
  // CAMBIAR ROL
  // ============================================================

  const handleRoleChange = (
    value: string,
  ) => {
    setRoleId(value);

    setError("");

    const role =
      activeRoles.find(
        (item) =>
          item.id ===
          Number(value),
      );

    /*
     * ADMIN no necesita warehouse.
     *
     * Si cambiamos de LOGISTICS a ADMIN,
     * limpiamos automáticamente la sede.
     */
    if (
      role?.code ===
      "ADMIN"
    ) {
      setWarehouseId("");
    }
  };

  // ============================================================
  // SUBMIT
  // ============================================================

  const handleSubmit = (
    event:
      React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    setError("");

    // ==========================================================
    // USERNAME
    // ==========================================================

    if (
      username.trim().length <
      4
    ) {
      setError(
        "El username debe tener al menos 4 caracteres.",
      );

      return;
    }

    if (
      username.trim().length >
      30
    ) {
      setError(
        "El username no puede superar los 30 caracteres.",
      );

      return;
    }

    // ==========================================================
    // NOMBRES
    // ==========================================================

    if (
      !firstName.trim() ||
      !lastName.trim()
    ) {
      setError(
        "Ingresa el nombre y apellido.",
      );

      return;
    }

    // ==========================================================
    // EMAIL
    // ==========================================================

    if (!email.trim()) {
      setError(
        "Ingresa el correo electrónico.",
      );

      return;
    }

    // ==========================================================
    // ROL
    // ==========================================================

    if (!Number(roleId)) {
      setError(
        "Selecciona un rol.",
      );

      return;
    }

    if (
      !selectedRole
    ) {
      setError(
        "El rol seleccionado no es válido.",
      );

      return;
    }

    // ==========================================================
    // LOGISTICS DEBE TENER WAREHOUSE
    // ==========================================================

    if (
      isLogisticsRole &&
      !warehouseId
    ) {
      setError(
        "Los usuarios de logística deben tener una mina o almacén asignado.",
      );

      return;
    }

    // ==========================================================
    // PASSWORD NUEVO USUARIO
    // ==========================================================

    if (
      !isEditing &&
      password.length < 8
    ) {
      setError(
        "La contraseña debe tener al menos 8 caracteres.",
      );

      return;
    }

    // ==========================================================
    // PASSWORD EDICIÓN
    // ==========================================================

    if (
      isEditing &&
      password &&
      password.length < 8
    ) {
      setError(
        "La nueva contraseña debe tener al menos 8 caracteres.",
      );

      return;
    }

    // ==========================================================
    // CREAR
    // ==========================================================

    if (!isEditing) {
      const data:
        CreateUserDto = {
        username:
          username.trim(),

        firstName:
          firstName.trim(),

        lastName:
          lastName.trim(),

        email:
          email
            .trim()
            .toLowerCase(),

        phone:
          phone.trim() ||
          undefined,

        position:
          position.trim() ||
          undefined,

        password,

        roleId:
          Number(roleId),
      };

      /*
       * Solo LOGISTICS tendrá warehouse.
       */
      if (
        isLogisticsRole &&
        warehouseId
      ) {
        data.warehouseId =
          Number(
            warehouseId,
          );
      }

      onSubmit(data);

      return;
    }

    // ==========================================================
    // EDITAR
    // ==========================================================

    const data:
      UpdateUserDto = {
      username:
        username.trim(),

      firstName:
        firstName.trim(),

      lastName:
        lastName.trim(),

      email:
        email
          .trim()
          .toLowerCase(),

      phone:
        phone.trim(),

      position:
        position.trim(),

      roleId:
        Number(roleId),

      /*
       * ADMIN → null
       *
       * LOGISTICS → warehouse seleccionado.
       */
      warehouseId:
        isAdminRole
          ? null
          : warehouseId
            ? Number(
                warehouseId,
              )
            : null,
    };

    /*
     * Solo enviamos password si
     * realmente se escribió una nueva.
     */
    if (password) {
      data.password =
        password;
    }

    onSubmit(data);
  };

  // ============================================================
  // UI
  // ============================================================

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={
        isEditing
          ? "Editar usuario"
          : "Nuevo usuario"
      }
    >
      <form
        onSubmit={
          handleSubmit
        }
        className="space-y-6"
      >
        {/* =====================================================
            INFORMACIÓN PERSONAL
        ===================================================== */}

        <div>
          <div className="mb-4 flex items-center gap-2">
            <UserRound
              size={18}
              className="text-gray-500"
            />

            <h3 className="font-semibold text-gray-800">
              Información del usuario
            </h3>
          </div>

          <div
            className="
              grid
              grid-cols-1
              gap-4
              md:grid-cols-2
            "
          >
            {/* USERNAME */}

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Username *
              </label>

              <Input
                value={
                  username
                }
                disabled={
                  loading
                }
                placeholder="Ej. jperez"
                onChange={(
                  event,
                ) =>
                  setUsername(
                    event.target.value,
                  )
                }
              />
            </div>

            {/* CARGO */}

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Cargo
              </label>

              <Input
                value={
                  position
                }
                disabled={
                  loading
                }
                placeholder="Ej. Supervisor de logística"
                onChange={(
                  event,
                ) =>
                  setPosition(
                    event.target.value,
                  )
                }
              />
            </div>

            {/* NOMBRES */}

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Nombres *
              </label>

              <Input
                value={
                  firstName
                }
                disabled={
                  loading
                }
                placeholder="Nombres"
                onChange={(
                  event,
                ) =>
                  setFirstName(
                    event.target.value,
                  )
                }
              />
            </div>

            {/* APELLIDOS */}

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Apellidos *
              </label>

              <Input
                value={
                  lastName
                }
                disabled={
                  loading
                }
                placeholder="Apellidos"
                onChange={(
                  event,
                ) =>
                  setLastName(
                    event.target.value,
                  )
                }
              />
            </div>

            {/* EMAIL */}

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Correo electrónico *
              </label>

              <Input
                type="email"
                value={
                  email
                }
                disabled={
                  loading
                }
                placeholder="usuario@empresa.com"
                onChange={(
                  event,
                ) =>
                  setEmail(
                    event.target.value,
                  )
                }
              />
            </div>

            {/* TELÉFONO */}

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Teléfono
              </label>

              <Input
                value={
                  phone
                }
                disabled={
                  loading
                }
                placeholder="999 999 999"
                onChange={(
                  event,
                ) =>
                  setPhone(
                    event.target.value,
                  )
                }
              />
            </div>
          </div>
        </div>

        {/* =====================================================
            ACCESO
        ===================================================== */}

        <div>
          <div className="mb-4 flex items-center gap-2">
            <ShieldCheck
              size={18}
              className="text-gray-500"
            />

            <h3 className="font-semibold text-gray-800">
              Acceso al sistema
            </h3>
          </div>

          <div
            className="
              grid
              grid-cols-1
              gap-4
              md:grid-cols-2
            "
          >
            {/* ROL */}

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Rol *
              </label>

              <select
                value={
                  roleId
                }
                disabled={
                  loading
                }
                onChange={(
                  event,
                ) =>
                  handleRoleChange(
                    event.target.value,
                  )
                }
                className="
                  h-10
                  w-full
                  rounded-lg
                  border
                  border-gray-300
                  bg-white
                  px-3
                  text-sm
                  text-gray-700
                  outline-none
                  focus:border-orange-500
                  focus:ring-2
                  focus:ring-orange-100
                "
              >
                <option value="">
                  Seleccionar rol
                </option>

                {activeRoles.map(
                  (role) => (
                    <option
                      key={
                        role.id
                      }
                      value={
                        role.id
                      }
                    >
                      {
                        role.name
                      }{" "}
                      ({
                        role.code
                      })
                    </option>
                  ),
                )}
              </select>

              <p className="mt-1 text-xs text-gray-400">
                Solo se utilizan los roles Administrador y Logística.
              </p>
            </div>

            {/* PASSWORD */}

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                {isEditing
                  ? "Nueva contraseña"
                  : "Contraseña *"}
              </label>

              <Input
                type="password"
                value={
                  password
                }
                disabled={
                  loading
                }
                placeholder={
                  isEditing
                    ? "Dejar vacío para conservar"
                    : "Mínimo 8 caracteres"
                }
                onChange={(
                  event,
                ) =>
                  setPassword(
                    event.target.value,
                  )
                }
              />

              {isEditing && (
                <p className="mt-1 text-xs text-gray-400">
                  Déjala vacía si no deseas cambiarla.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* =====================================================
            WAREHOUSE
            SOLO LOGISTICS
        ===================================================== */}

        {isLogisticsRole && (
          <div>
            <div className="mb-4 flex items-center gap-2">
              <Building2
                size={18}
                className="text-gray-500"
              />

              <h3 className="font-semibold text-gray-800">
                Mina / Almacén asignado
              </h3>
            </div>

            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Mina / Almacén *
            </label>

            <select
              value={
                warehouseId
              }
              disabled={
                loading
              }
              onChange={(
                event,
              ) => {
                setWarehouseId(
                  event.target.value,
                );

                setError("");
              }}
              className="
                h-10
                w-full
                rounded-lg
                border
                border-gray-300
                bg-white
                px-3
                text-sm
                text-gray-700
                outline-none
                focus:border-orange-500
                focus:ring-2
                focus:ring-orange-100
              "
            >
              <option value="">
                Selecciona mina o almacén
              </option>

              {activeWarehouses.map(
                (
                  warehouse,
                ) => (
                  <option
                    key={
                      warehouse.id
                    }
                    value={
                      warehouse.id
                    }
                  >
                    {
                      warehouse.name
                    }

                    {" - "}

                    {
                      warehouse.type
                    }

                    {warehouse.city
                      ? ` - ${warehouse.city}`
                      : ""}
                  </option>
                ),
              )}
            </select>

            <div
              className="
                mt-3
                rounded-xl
                border
                border-blue-200
                bg-blue-50
                px-4
                py-3
              "
            >
              <p className="text-sm font-medium text-blue-700">
                Alcance operativo
              </p>

              <p className="mt-1 text-xs text-blue-600">
                El usuario de logística tendrá acceso operativo únicamente a la información relacionada con esta mina o almacén.
              </p>
            </div>
          </div>
        )}

        {/* =====================================================
            ADMIN
        ===================================================== */}

        {isAdminRole && (
          <div
            className="
              rounded-xl
              border
              border-purple-200
              bg-purple-50
              px-4
              py-3
            "
          >
            <p className="text-sm font-semibold text-purple-700">
              Acceso administrativo
            </p>

            <p className="mt-1 text-xs text-purple-600">
              El administrador tendrá acceso global al sistema y no necesita una mina o almacén asignado.
            </p>
          </div>
        )}

        {/* =====================================================
            ERROR
        ===================================================== */}

        {error && (
          <div
            className="
              rounded-xl
              border
              border-red-200
              bg-red-50
              px-4
              py-3
              text-sm
              text-red-600
            "
          >
            {error}
          </div>
        )}

        {/* =====================================================
            ACCIONES
        ===================================================== */}

        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="secondary"
            disabled={
              loading
            }
            onClick={
              onClose
            }
          >
            Cancelar
          </Button>

          <Button
            type="submit"
            disabled={
              loading
            }
          >
            {loading
              ? "Guardando..."
              : isEditing
                ? "Guardar cambios"
                : "Crear usuario"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}