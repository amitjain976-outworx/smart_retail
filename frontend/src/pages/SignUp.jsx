import { useEffect, useState, } from "react";
import { useNavigate } from "react-router-dom";

import { registerUser, getRoles, } from "../services/api";

const SignUp = () => {

    const navigate = useNavigate();

    // ==========================================================
    // STATE
    // ==========================================================

    const [passwordError, setPasswordError] = useState("");
    const [formData, setFormData] = useState({
        full_name: "",
        email: "",
        password: "",
        role_id: "",
    });

    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [rolesLoading, setRolesLoading] = useState(true);
    const [success, setSuccess] = useState("");
    const [error, setError] = useState("");


    // ==========================================================
    // FETCH ROLES
    // ==========================================================

    useEffect(() => {
        let mounted = true;
        const fetchRoles = async () => {
            try {
                setRolesLoading(true);
                const data = await getRoles();
                const availableRoles = data;

                if (mounted) {
                    setRoles(availableRoles);
                }

            } catch (err) {

                console.error(
                    "Role loading failed:",
                    err
                );

                if (mounted) {

                    setError(
                        "Unable to load user roles."
                    );
                }

            } finally {
                if (mounted) {
                    setRolesLoading(false);
                }
            }
        };

        fetchRoles();

        return () => {
            mounted = false;
        };

    }, []);


    const validatePassword = (password) => {

        if (password.length < 8) {
            return "Password must be at least 8 characters.";
        }

        if (!/[A-Z]/.test(password)) {
            return "Password must contain at least one uppercase letter.";
        }

        if (!/[a-z]/.test(password)) {
            return "Password must contain at least one lowercase letter.";
        }

        if (!/[0-9]/.test(password)) {
            return "Password must contain at least one number.";
        }

        return "";
    };

    // ==========================================================
    // INPUT CHANGE
    // ==========================================================

    const handleChange = (e) => {

        const {
            name,
            value,
        } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]:
                name === "role_id"
                    ? Number(value)
                    : value,
        }));

        if (name === "password") {
            setPasswordError(
                validatePassword(value)
            );
        }
    };

    // ==========================================================
    // SUBMIT
    // ==========================================================

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        const passwordValidation =
            validatePassword(formData.password);

        if (passwordValidation) {

            setPasswordError(
                passwordValidation
            );

            return;
        }

        if (!formData.role_id) {
            setError(
                "Please select a role."
            );
            return;
        }

        try {
            setLoading(true);
            const response =
                await registerUser(formData);
            setSuccess(
                response.message
            );

            setFormData((prev) => ({
                ...prev,

                full_name: "",
                email: "",
                password: "",
            }));

            setTimeout(() => {
                navigate(
                    "/admin",
                    {
                        replace: true,
                    }
                );

            }, 1500);

        } catch (err) {

            console.error(
                "User creation failed:",
                err
            );

            setError(
                err?.response?.data?.detail ||
                "Failed to create user."
            );

        } finally {
            setLoading(false);
        }
    };


    // ==========================================================
    // UI
    // ==========================================================

    return (
        <div className="min-h-screen bg-slate-100 flex items-center justify-center px-4" >

            <div
                className="
                    w-full
                    max-w-lg
                    bg-white
                    rounded-2xl
                    shadow-xl
                    p-8
                "
            >


                {/* HEADER */}

                <div className="text-center mb-8">

                    <h1 className="text-3xl font-bold text-slate-800">
                        Create User
                    </h1>

                    <p className="text-slate-500 mt-2">
                        Admin can create Cashiers and Customers
                    </p>
                </div>

                {/* SUCCESS */}

                {
                    success && (

                        <div
                            className="
                                mb-4
                                rounded-lg
                                border
                                border-green-300
                                bg-green-100
                                px-4
                                py-3
                                text-green-700
                            "
                        >
                            {success}
                        </div>
                    )
                }


                {/* ERROR */}

                {
                    error && (
                        <div
                            className="
                                mb-4
                                rounded-lg
                                border
                                border-red-300
                                bg-red-100
                                px-4
                                py-3
                                text-red-700
                            "
                        >
                            {error}
                        </div>
                    )
                }

                <form
                    onSubmit={handleSubmit}
                    className="space-y-5"
                >


                    {/* NAME */}
                    <div>
                        <label
                            className="
                                block
                                mb-2
                                text-sm
                                font-medium
                                text-slate-700
                            "
                        >
                            Full Name
                        </label>


                        <input
                            type="text"
                            name="full_name"
                            value={
                                formData.full_name
                            }
                            onChange={
                                handleChange
                            }
                            required
                            autoComplete="name"
                            minLength={2}
                            className="
                                w-full
                                rounded-lg
                                border
                                border-slate-300
                                px-4
                                py-3
                                focus:outline-none
                                focus:ring-2
                                focus:ring-blue-500
                            "
                        />
                    </div>


                    {/* EMAIL */}
                    <div>
                        <label
                            className="
                                block
                                mb-2
                                text-sm
                                font-medium
                                text-slate-700
                            "
                        >
                            Email
                        </label>


                        <input
                            type="email"
                            name="email"
                            value={
                                formData.email
                            }
                            onChange={
                                handleChange
                            }
                            required
                            autoComplete="email"
                            className="
                                w-full
                                rounded-lg
                                border
                                border-slate-300
                                px-4
                                py-3
                                focus:outline-none
                                focus:ring-2
                                focus:ring-blue-500
                            "
                        />
                    </div>

                    {/* PASSWORD */}

                    <div>
                        <label
                            className="
            block
            mb-2
            text-sm
            font-medium
            text-slate-700
        "
                        >
                            Password
                        </label>

                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            minLength={8}
                            autoComplete="new-password"
                            className={`
            w-full
            rounded-lg
            border
            px-4
            py-3
            focus:outline-none
            focus:ring-2
            ${passwordError
                                    ? "border-red-400 focus:ring-red-500"
                                    : "border-slate-300 focus:ring-blue-500"
                                }
        `}
                        />

                        <div
                            className="
            mt-2
            text-xs
            text-slate-500
            space-y-1
        "
                        >
                            <p>Password must contain:</p>

                            <ul className="list-disc pl-5">
                                <li>At least 8 characters</li>
                                <li>One uppercase letter (A-Z)</li>
                                <li>One lowercase letter (a-z)</li>
                                <li>One number (0-9)</li>
                            </ul>
                        </div>

                        {passwordError && (
                            <p
                                className="
                                    mt-2
                                    text-sm
                                    text-red-600
                                "
                            >
                                {passwordError}
                            </p>
                        )}
                    </div>

                    {/* ROLE */}

                    <div>
                        <label
                            className="
                                block
                                mb-2
                                text-sm
                                font-medium
                                text-slate-700
                            "
                        >
                            User Role
                        </label>

                        <select
                            name="role_id"
                            value={
                                formData.role_id
                            }

                            onChange={handleChange}
                            disabled={rolesLoading}
                            required
                            className="
                                w-full
                                rounded-lg
                                border
                                border-slate-300
                                px-4
                                py-3
                                focus:outline-none
                                focus:ring-2
                                focus:ring-blue-500
                                disabled:bg-slate-100
                            "
                        >
                            <option value="">
                                {
                                    rolesLoading
                                        ? "Loading roles..."
                                        : "Select Role"
                                }
                            </option>

                            {
                                roles.map(
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
                                                role.role_name
                                            }
                                        </option>
                                    )
                                )
                            }
                        </select>
                    </div>

                    {/* BUTTON */}

                    <button
                        type="submit"
                        disabled={
                            loading ||
                            rolesLoading ||
                            !formData.role_id
                        }


                        className="
                            w-full
                            rounded-lg
                            bg-blue-600
                            px-4
                            py-3
                            text-white
                            font-medium
                            hover:bg-blue-700
                            disabled:opacity-50
                            disabled:cursor-not-allowed
                        "

                    >

                        {
                            loading
                                ? "Creating User..."
                                : "Create User"
                        }


                    </button>
                </form>
            </div>
        </div>
    );
};

export default SignUp;
