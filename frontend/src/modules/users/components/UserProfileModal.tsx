import {
  useEffect,
  useState,
} from "react";

import {
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Mail,
  MapPin,
  Phone,
  Shield,
  ShieldAlert,
  User as UserIcon,
} from "lucide-react";

import {
  Button,
} from "@/components/ui/Button";

import {
  Input,
} from "@/components/ui/Input";

import {
  Modal,
} from "@/components/ui/Modal";

import {
  useAuth,
} from "@/modules/auth/contexts/AuthContexts";

import {
  useChangeOwnPassword,
  useOwnProfile,
  useUpdateOwnProfile,
} from "../hooks/useUsers";

interface Props {
  open: boolean;
  onClose: () => void;
  initialTab?: "profile" | "security";
}

export function UserProfileModal({
  open,
  onClose,
  initialTab = "profile",
}: Props) {
  const {
    user: authUser,
    updateUser: updateAuthUser,
  } = useAuth();

  const {
    data: profileData,
    refetch: refetchProfile,
  } = useOwnProfile();

  const updateProfileMutation = useUpdateOwnProfile();
  const changePasswordMutation = useChangeOwnPassword();

  const [activeTab, setActiveTab] = useState<"profile" | "security">(initialTab);

  // Formulario Perfil
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [position, setPosition] = useState("");
  const [profileError, setProfileError] = useState("");
  const [profileSuccess, setProfileSuccess] = useState("");

  // Formulario Contraseña
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");

  // Sincronizar datos al abrir
  useEffect(() => {
    if (!open) {
      return;
    }

    setActiveTab(initialTab);
    setProfileError("");
    setProfileSuccess("");
    setPasswordError("");
    setPasswordSuccess("");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);

    refetchProfile();

    const currentUser = profileData || authUser;
    if (currentUser) {
      setFirstName(currentUser.firstName || "");
      setLastName(currentUser.lastName || "");
      setEmail(currentUser.email || "");
      setPhone(currentUser.phone || "");
      setPosition(currentUser.position || "");
    }
  }, [open, initialTab]);

  // Actualizar formulario cuando cargue la consulta
  useEffect(() => {
    if (profileData && open) {
      setFirstName(profileData.firstName || "");
      setLastName(profileData.lastName || "");
      setEmail(profileData.email || "");
      setPhone(profileData.phone || "");
      setPosition(profileData.position || "");
    }
  }, [profileData, open]);

  if (!open) {
    return null;
  }

  const currentUser = profileData || authUser;

  const roleName =
    currentUser?.role?.name ||
    currentUser?.role?.code ||
    "Logística";

  const warehouseName =
    currentUser?.warehouse?.name ||
    "Sin almacén asignado";

  const isSavingProfile = updateProfileMutation.isPending;
  const isSavingPassword = changePasswordMutation.isPending;

  const handleClose = () => {
    if (isSavingProfile || isSavingPassword) {
      return;
    }
    onClose();
  };

  const getApiErrorMessage = (error: unknown): string | null => {
    if (typeof error !== "object" || error === null) {
      return null;
    }

    const errObj = error as {
      response?: {
        data?: {
          message?: string | string[];
        };
      };
    };

    const message = errObj.response?.data?.message;

    if (Array.isArray(message)) {
      return message.join(" ");
    }

    if (typeof message === "string") {
      return message;
    }

    return null;
  };

  // Guardar datos personales y correo
  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError("");
    setProfileSuccess("");

    if (!firstName.trim()) {
      setProfileError("El nombre no puede estar vacío.");
      return;
    }

    if (!lastName.trim()) {
      setProfileError("El apellido no puede estar vacío.");
      return;
    }

    if (!email.trim()) {
      setProfileError("El correo electrónico es obligatorio.");
      return;
    }

    try {
      const updated = await updateProfileMutation.mutateAsync({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim() || undefined,
        position: position.trim() || undefined,
      });

      // Actualizar sesión en AuthContext
      updateAuthUser({
        firstName: updated.firstName,
        lastName: updated.lastName,
        email: updated.email,
        phone: updated.phone || undefined,
        position: updated.position || undefined,
      });

      setProfileSuccess("Datos personales y correo actualizados correctamente.");
    } catch (err) {
      const msg = getApiErrorMessage(err);
      setProfileError(
        msg || "No se pudo actualizar el perfil. Verifica la información ingresada.",
      );
    }
  };

  // Guardar contraseña
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");

    if (!currentPassword) {
      setPasswordError("Ingresa tu contraseña actual.");
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError("La nueva contraseña debe tener al menos 8 caracteres.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("La confirmación de la nueva contraseña no coincide.");
      return;
    }

    if (currentPassword === newPassword) {
      setPasswordError("La nueva contraseña debe ser diferente a la contraseña actual.");
      return;
    }

    try {
      const res = await changePasswordMutation.mutateAsync({
        currentPassword,
        newPassword,
        confirmPassword,
      });

      setPasswordSuccess(
        res.message || "Tu contraseña ha sido actualizada exitosamente.",
      );
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      const msg = getApiErrorMessage(err);
      setPasswordError(
        msg || "No se pudo cambiar la contraseña. Verifica tu contraseña actual.",
      );
    }
  };

  const initials =
    [firstName || currentUser?.firstName, lastName || currentUser?.lastName]
      .filter((n): n is string => Boolean(n))
      .map((n) => n[0]?.toUpperCase() || "")
      .join("") || "U";

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Mi Perfil y Seguridad"
      size="lg"
    >
      <div className="space-y-6">
        {/* =====================================================
            BANNER RESUMEN DEL USUARIO
        ===================================================== */}
        <div className="flex flex-col gap-4 rounded-2xl border border-orange-100 bg-gradient-to-r from-orange-50 via-white to-amber-50 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3.5">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 text-lg font-black text-white shadow-md shadow-orange-500/20">
              {initials}
            </div>

            <div className="min-w-0">
              <h3 className="truncate text-base font-bold text-slate-800">
                {[firstName || currentUser?.firstName, lastName || currentUser?.lastName]
                  .filter(Boolean)
                  .join(" ") || currentUser?.username}
              </h3>
              <p className="truncate text-xs font-medium text-slate-500">
                @{currentUser?.username} • {email || currentUser?.email}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-orange-200 bg-orange-100/70 px-3 py-1 text-xs font-bold text-orange-800">
              <Shield size={13} className="text-orange-600" />
              {roleName}
            </span>

            {warehouseName && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700 shadow-2xs">
                <MapPin size={13} className="text-slate-500" />
                {warehouseName}
              </span>
            )}
          </div>
        </div>

        {/* =====================================================
            PESTAÑAS DE NAVEGACIÓN
        ===================================================== */}
        <div className="flex border-b border-slate-200">
          <button
            type="button"
            onClick={() => setActiveTab("profile")}
            className={`
              flex items-center gap-2 border-b-2 px-5 py-3 text-sm font-bold transition
              ${
                activeTab === "profile"
                  ? "border-orange-500 text-orange-600"
                  : "border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-800"
              }
            `}
          >
            <UserIcon size={17} />
            Datos Personales
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("security")}
            className={`
              flex items-center gap-2 border-b-2 px-5 py-3 text-sm font-bold transition
              ${
                activeTab === "security"
                  ? "border-orange-500 text-orange-600"
                  : "border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-800"
              }
            `}
          >
            <KeyRound size={17} />
            Seguridad y Contraseña
          </button>
        </div>

        {/* =====================================================
            TAB 1: DATOS PERSONALES Y CORREO
        ===================================================== */}
        {activeTab === "profile" && (
          <form onSubmit={handleProfileSubmit} className="space-y-4">
            {profileError && (
              <div className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 p-3.5 text-sm text-red-700">
                <ShieldAlert size={18} className="mt-0.5 shrink-0 text-red-600" />
                <span>{profileError}</span>
              </div>
            )}

            {profileSuccess && (
              <div className="flex items-start gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 p-3.5 text-sm font-medium text-emerald-800">
                <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-emerald-600" />
                <span>{profileSuccess}</span>
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-600">
                  Nombres *
                </label>
                <Input
                  type="text"
                  value={firstName}
                  disabled={isSavingProfile}
                  placeholder="Tus nombres"
                  onChange={(e) => {
                    setFirstName(e.target.value);
                    setProfileError("");
                    setProfileSuccess("");
                  }}
                  required
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-600">
                  Apellidos *
                </label>
                <Input
                  type="text"
                  value={lastName}
                  disabled={isSavingProfile}
                  placeholder="Tus apellidos"
                  onChange={(e) => {
                    setLastName(e.target.value);
                    setProfileError("");
                    setProfileSuccess("");
                  }}
                  required
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-600">
                  Correo Electrónico *
                </label>
                <div className="relative">
                  <Input
                    type="email"
                    value={email}
                    disabled={isSavingProfile}
                    placeholder="usuario@teincomin.com"
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setProfileError("");
                      setProfileSuccess("");
                    }}
                    required
                  />
                  <Mail
                    size={16}
                    className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-600">
                  Teléfono / Celular
                </label>
                <div className="relative">
                  <Input
                    type="text"
                    value={phone}
                    disabled={isSavingProfile}
                    placeholder="Ej. 999 888 777"
                    onChange={(e) => {
                      setPhone(e.target.value);
                      setProfileError("");
                      setProfileSuccess("");
                    }}
                  />
                  <Phone
                    size={16}
                    className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-600">
                Cargo / Puesto de Trabajo
              </label>
              <Input
                type="text"
                value={position}
                disabled={isSavingProfile}
                placeholder="Ej. Encargado de Logística Mina"
                onChange={(e) => {
                  setPosition(e.target.value);
                  setProfileError("");
                  setProfileSuccess("");
                }}
              />
            </div>

            {/* Información asignada por el sistema (Solo lectura) */}
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                Información del Sistema (Asignada por Administración)
              </p>
              <div className="grid gap-3 sm:grid-cols-3 text-xs">
                <div>
                  <span className="font-semibold text-slate-600">Usuario de acceso:</span>
                  <p className="mt-0.5 font-bold text-slate-800">@{currentUser?.username}</p>
                </div>
                <div>
                  <span className="font-semibold text-slate-600">Rol asignado:</span>
                  <p className="mt-0.5 font-bold text-orange-700">{roleName}</p>
                </div>
                <div>
                  <span className="font-semibold text-slate-600">Mina / Almacén:</span>
                  <p className="mt-0.5 font-bold text-slate-800">{warehouseName}</p>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3">
              <Button
                type="button"
                variant="secondary"
                disabled={isSavingProfile}
                onClick={handleClose}
              >
                Cerrar
              </Button>

              <Button
                type="submit"
                disabled={isSavingProfile}
                className="bg-orange-500 hover:bg-orange-600 font-bold"
              >
                {isSavingProfile ? "Guardando..." : "Guardar Cambios"}
              </Button>
            </div>
          </form>
        )}

        {/* =====================================================
            TAB 2: SEGURIDAD Y CONTRASEÑA
        ===================================================== */}
        {activeTab === "security" && (
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div className="flex items-start gap-3 rounded-xl border border-blue-100 bg-blue-50 p-3.5 text-xs text-blue-800">
              <Shield size={18} className="mt-0.5 shrink-0 text-blue-600" />
              <div>
                <p className="font-bold">Seguridad de tu cuenta</p>
                <p className="mt-0.5 leading-relaxed text-blue-700">
                  Para actualizar tu contraseña, debes ingresar tu contraseña actual por motivos de seguridad. La nueva contraseña debe tener mínimo 8 caracteres.
                </p>
              </div>
            </div>

            {passwordError && (
              <div className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 p-3.5 text-sm text-red-700">
                <ShieldAlert size={18} className="mt-0.5 shrink-0 text-red-600" />
                <span>{passwordError}</span>
              </div>
            )}

            {passwordSuccess && (
              <div className="flex items-start gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 p-3.5 text-sm font-medium text-emerald-800">
                <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-emerald-600" />
                <span>{passwordSuccess}</span>
              </div>
            )}

            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-600">
                Contraseña Actual *
              </label>
              <div className="relative">
                <Input
                  type={showCurrentPassword ? "text" : "password"}
                  value={currentPassword}
                  disabled={isSavingPassword}
                  placeholder="Ingresa tu contraseña actual"
                  className="pr-11"
                  onChange={(e) => {
                    setCurrentPassword(e.target.value);
                    setPasswordError("");
                    setPasswordSuccess("");
                  }}
                  required
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowCurrentPassword((prev) => !prev)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                >
                  {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-600">
                  Nueva Contraseña *
                </label>
                <div className="relative">
                  <Input
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    disabled={isSavingPassword}
                    placeholder="Mínimo 8 caracteres"
                    className="pr-11"
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                      setPasswordError("");
                      setPasswordSuccess("");
                    }}
                    required
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowNewPassword((prev) => !prev)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                  >
                    {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-600">
                  Confirmar Nueva Contraseña *
                </label>
                <div className="relative">
                  <Input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    disabled={isSavingPassword}
                    placeholder="Repite la nueva contraseña"
                    className="pr-11"
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      setPasswordError("");
                      setPasswordSuccess("");
                    }}
                    required
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                  >
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3">
              <Button
                type="button"
                variant="secondary"
                disabled={isSavingPassword}
                onClick={handleClose}
              >
                Cerrar
              </Button>

              <Button
                type="submit"
                disabled={isSavingPassword}
                className="bg-orange-500 hover:bg-orange-600 font-bold"
              >
                {isSavingPassword ? "Actualizando..." : "Cambiar Contraseña"}
              </Button>
            </div>
          </form>
        )}
      </div>
    </Modal>
  );
}
