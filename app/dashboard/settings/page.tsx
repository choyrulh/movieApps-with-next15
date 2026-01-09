"use client";

import { useState, useRef, useEffect } from "react";
import {
  User,
  Film,
  Bell,
  Shield,
  CreditCard,
  Globe,
  HelpCircle,
  Edit,
  ChevronRight,
  Eye,
  EyeOff,
  Check,
  Save,
  Loader2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { ImageWithFallback } from "@/components/common/ImageWithFallback";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import axios from "axios"; // Pastikan install axios
import { toast } from "sonner";
import { getCookie } from "@/Service/fetchUser";

// --- Types ---
interface UserPreferences {
  favoriteGenres: string[];
  maturityRating: string;
  language: string;
  subtitleLanguage: string;
  darkMode: boolean;
  autoplay: boolean;
  notifications: {
    email: boolean;
    push: boolean;
    newReleases: boolean;
    recommendations: boolean;
  };
}

export default function Page() {
  const [mounted, setMounted] = useState(false);
  const {
    user: userProfile,
    isLoadingUser: isLoading,
    refetchUser: refetch,
  } = useAuth();

  // Local State untuk Edit Mode Profile Info
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    bio: "",
    phone: "",
    avatar: "",
  });

  // Local State untuk Preferences (agar UI responsif instan)
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);

  // Password State
  const [password, setPassword] = useState({
    current: "",
    new: "",
    confirm: "",
  });
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Constants
  const genres = [
    { id: 28, name: "Action" },
    { id: 12, name: "Adventure" },
    { id: 16, name: "Animation" },
    { id: 35, name: "Comedy" },
    { id: 80, name: "Crime" },
    { id: 99, name: "Documentary" },
    { id: 18, name: "Drama" },
    { id: 14, name: "Fantasy" },
    { id: 27, name: "Horror" },
    { id: 878, name: "Sci-Fi" },
    { id: 53, name: "Thriller" },
  ];

  // --- Initialize State when Data Loads ---
  useEffect(() => {
    setMounted(true);
    if (userProfile?.data) {
      setFormData({
        name: userProfile.data.name || "",
        bio: userProfile.data.profile?.bio || "",
        phone: userProfile.data.profile?.phone || "",
        avatar: userProfile.data.profile?.avatar || "/default-avatar.png",
      });

      // Default preferences fallback
      setPreferences({
        favoriteGenres: userProfile.data.preferences?.favoriteGenres || [],
        maturityRating:
          userProfile.data.preferences?.maturityRating || "Semua Umur",
        language: userProfile.data.preferences?.language || "Bahasa Indonesia",
        subtitleLanguage:
          userProfile.data.preferences?.subtitleLanguage || "Bahasa Indonesia",
        darkMode: userProfile.data.preferences?.darkMode ?? true,
        autoplay: userProfile.data.preferences?.autoplay ?? true,
        notifications: {
          email: userProfile.data.preferences?.notifications?.email ?? true,
          push: userProfile.data.preferences?.notifications?.push ?? true,
          newReleases:
            userProfile.data.preferences?.notifications?.newReleases ?? true,
          recommendations:
            userProfile.data.preferences?.notifications?.recommendations ??
            true,
        },
      });
    }
  }, [userProfile]);

  // --- Handlers ---
  // Fungsi untuk mendapatkan avatar acak
  const handleRandomAvatar = () => {
    // Generate angka acak 1 - 30
    const randomNum = Math.floor(Math.random() * 30) + 1;
    const newAvatarUrl = `https://avatar.iran.liara.run/public/${randomNum}`;

    // Update local state
    setFormData((prev) => ({ ...prev, avatar: newAvatarUrl }));

    // Memberikan feedback ke user
    toast.success("Avatar acak dipilih! Jangan lupa klik Simpan.");
  };

  // 1. General Profile Update
  const handleProfileSave = async () => {
    try {
      const token = getCookie("user");
      await axios.put(
        `https://backend-movie-apps-api-one.vercel.app/api/user/profile`,
        {
          name: formData.name,
          profile: {
            bio: formData.bio,
            phone: formData.phone,
            avatar: formData.avatar,
          },
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success("Profil berhasil disimpan!");
      setEditMode(false);
      refetch();
    } catch (error) {
      toast.error("Gagal menyimpan profil.");
      console.error(error);
    }
  };

  // 2. Real-time Preference Update (Auto-save logic)
  const updatePreference = async (newPrefs: Partial<UserPreferences>) => {
    if (!preferences) return;

    // Optimistic Update UI
    const updatedPreferences = { ...preferences, ...newPrefs };
    setPreferences(updatedPreferences); // Update local UI immediately

    // API Call
    try {
      const token = getCookie("user");
      await axios.put(
        `https://backend-movie-apps-api-one.vercel.app/api/user/profile`,
        {
          preferences: updatedPreferences,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (error) {
      toast.error("Gagal menyingkronkan pengaturan.");
      // Rollback logic could go here
    }
  };

  // 3. Notification Toggle
  const toggleNotification = (key: keyof UserPreferences["notifications"]) => {
    if (!preferences) return;
    const newNotifications = {
      ...preferences.notifications,
      [key]: !preferences.notifications[key],
    };
    updatePreference({ notifications: newNotifications });
  };

  // 4. Genre Toggle
  const handleGenreToggle = (genreName: string) => {
    if (!preferences) return;
    let currentGenres = [...preferences.favoriteGenres];

    if (currentGenres.includes(genreName)) {
      currentGenres = currentGenres.filter((g) => g !== genreName);
    } else {
      currentGenres.push(genreName);
    }
    updatePreference({ favoriteGenres: currentGenres });
  };

  // 5. Password Update
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.new !== password.confirm) {
      toast.error("Konfirmasi password tidak cocok!");
      return;
    }

    setIsSavingPassword(true);
    try {
      const token = getCookie("user");
      await axios.put(
        `https://backend-movie-apps-api-one.vercel.app/api/auth/change-password`,
        {
          currentPassword: password.current,
          newPassword: password.new,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success("Password berhasil diubah!");
      setPassword({ current: "", new: "", confirm: "" });
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Gagal mengubah password");
    } finally {
      setIsSavingPassword(false);
    }
  };

  // 6. File Upload Simulation
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Logic upload ke server/cloudinary di sini
      // Untuk demo, kita buat fake URL
      const fakeUrl = URL.createObjectURL(file);
      setFormData({ ...formData, avatar: fakeUrl });
      toast("Jangan lupa klik Simpan untuk menerapkan foto baru.", {
        icon: "ℹ️",
      });
    }
  };

  if (!mounted || isLoading || !preferences)
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="animate-spin h-8 w-8 text-green-500" />
      </div>
    );

  return (
    <div className="max-w-4xl mx-auto px-4 pb-20 pt-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-blue-500">
          Pengaturan Akun
        </h1>
      </div>

      {/* --- Section 1: Profil --- */}
      <SectionContainer>
        <SectionHeading icon={<User size={20} />} title="Profil Saya" />

        {editMode ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6 bg-[#111111]/50 p-6 rounded-xl border border-black"
          >
            <div className="flex flex-col items-center mb-6">
              <div
                className="relative group cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-gray-700 group-hover:border-green-500 transition-colors">
                  <ImageWithFallback
                    src={formData.avatar || "/default-avatar.png"}
                    alt="Profile"
                    width={112}
                    height={112}
                    className="object-cover w-full h-full"
                    fallbackText="No Avatar"
                  />
                </div>
                {/* Tombol Ganti Avatar Acak */}
                <button
                  type="button"
                  onClick={handleRandomAvatar}
                  className="absolute bottom-0 right-0 p-2 bg-green-600 rounded-full text-white hover:bg-green-500 shadow-lg transition-transform hover:scale-110"
                  title="Ganti Avatar Acak"
                >
                  <Edit size={16} />
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-3">
                Klik tombol hijau untuk ganti avatar acak
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <InputField
                label="Nama Lengkap"
                value={formData.name}
                onChange={(v) => setFormData({ ...formData, name: v })}
              />
              <InputField
                label="Nomor Telepon"
                value={formData.phone}
                onChange={(v) => setFormData({ ...formData, phone: v })}
              />
              <div className="md:col-span-2">
                <label className="block text-sm text-gray-400 mb-1">Bio</label>
                <textarea
                  value={formData.bio}
                  onChange={(e) =>
                    setFormData({ ...formData, bio: e.target.value })
                  }
                  className="w-full bg-[#333333] rounded-lg px-4 py-2 text-white border border-gray-700 focus:border-green-500 focus:outline-none h-24 resize-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button
                onClick={() => setEditMode(false)}
                className="px-4 py-2 rounded-lg text-gray-300 hover:bg-gray-800"
              >
                Batal
              </button>
              <button
                onClick={handleProfileSave}
                className="flex items-center gap-2 px-6 py-2 bg-green-600 rounded-lg text-white hover:bg-green-700 font-medium"
              >
                <Save size={18} /> Simpan Perubahan
              </button>
            </div>
          </motion.div>
        ) : (
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-green-500/30 flex-shrink-0">
              <ImageWithFallback
                src={formData.avatar || "/default-avatar.png"}
                alt="Profile"
                width={80}
                height={80}
                className="object-cover w-full h-full"
                fallbackText="No Avatar"
              />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-white">
                {formData.name}
              </h3>
              <p className="text-gray-400 text-sm">
                {userProfile?.data?.email}
              </p>
              <p className="text-gray-500 text-sm mt-1">
                {formData.bio || "Belum ada bio"}
              </p>
            </div>
            <button
              onClick={() => setEditMode(true)}
              className="px-4 py-2 bg-[#555555]/50 hover:bg-[#555555] rounded-lg text-sm text-white transition flex items-center gap-2 border border-gray-600"
            >
              <Edit size={16} /> Edit Profil
            </button>
          </div>
        )}
      </SectionContainer>

      {/* --- Section 2: Keamanan --- */}
      <SectionContainer>
        <SectionHeading
          icon={<Shield size={20} />}
          title="Keamanan & Password"
        />
        <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-lg">
          <PasswordInput
            label="Password Saat Ini"
            value={password.current}
            show={showPassword.current}
            onChange={(v: any) => setPassword({ ...password, current: v })}
            onToggle={() =>
              setShowPassword({
                ...showPassword,
                current: !showPassword.current,
              })
            }
          />
          <div className="grid grid-cols-2 gap-4">
            <PasswordInput
              label="Password Baru"
              value={password.new}
              show={showPassword.new}
              onChange={(v: any) => setPassword({ ...password, new: v })}
              onToggle={() =>
                setShowPassword({ ...showPassword, new: !showPassword.new })
              }
            />
            <PasswordInput
              label="Konfirmasi"
              value={password.confirm}
              show={showPassword.confirm}
              onChange={(v: any) => setPassword({ ...password, confirm: v })}
              onToggle={() =>
                setShowPassword({
                  ...showPassword,
                  confirm: !showPassword.confirm,
                })
              }
            />
          </div>
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSavingPassword || !password.current}
              className={`px-5 py-2 rounded-lg text-white font-medium transition ${
                !password.current
                  ? "bg-[#555555] cursor-not-allowed text-gray-400"
                  : "bg-green-600 hover:bg-green-700"
              }`}
            >
              {isSavingPassword ? "Memproses..." : "Update Password"}
            </button>
          </div>
        </form>
      </SectionContainer>

      {/* --- Section 3: Berlangganan --- */}
      <SectionContainer>
        <SectionHeading
          icon={<CreditCard size={20} />}
          title="Status Langganan"
        />
        {userProfile?.data?.subscription?.plan === "Free" ? (
          <div className="bg-gradient-to-r from-gray-800 to-gray-700 rounded-xl p-6 flex justify-between items-center">
            <div>
              <h3 className="text-lg font-bold text-white">Paket Gratis</h3>
              <p className="text-gray-400 text-sm">
                Upgrade ke Premium untuk akses tanpa batas.
              </p>
            </div>
            <button className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-black font-bold rounded-lg">
              Upgrade Premium
            </button>
          </div>
        ) : (
          <div className="bg-gradient-to-r from-green-900/80 to-green-800/80 rounded-xl p-6 border border-green-700/50">
            <div className="flex justify-between items-start mb-4">
              <div>
                <span className="text-sm text-green-300 font-semibold tracking-wider">
                  PAKET AKTIF
                </span>
                <h3 className="text-2xl font-bold text-white mt-1">
                  {userProfile?.data?.subscription?.plan || "Premium"}
                </h3>
              </div>
              <span className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-xs font-bold border border-green-500/30">
                LUNAS
              </span>
            </div>
            <div className="space-y-1 text-sm text-gray-300">
              <p>
                Harga:{" "}
                <span className="font-semibold text-white">
                  {userProfile?.data?.subscription?.price || "Rp 59.000"}/bulan
                </span>
              </p>
              <p>
                Perpanjangan otomatis pada:{" "}
                <span className="font-semibold text-white">
                  {userProfile?.data?.subscription?.billingDate
                    ? new Date(
                        userProfile.data.subscription.billingDate
                      ).toLocaleDateString()
                    : "-"}
                </span>
              </p>
            </div>
          </div>
        )}
      </SectionContainer>

      {/* --- Section 4: Tampilan & Bahasa --- */}
      <SectionContainer>
        <SectionHeading
          icon={<Globe size={20} />}
          title="Preferensi Aplikasi"
        />
        <div className="space-y-1">
          <SettingsItem
            title="Mode Gelap"
            description="Menggunakan tema gelap yang nyaman di mata"
            action={
              <ToggleSwitch
                isChecked={preferences.darkMode}
                onChange={() =>
                  updatePreference({ darkMode: !preferences.darkMode })
                }
              />
            }
          />
          <SettingsItem
            title="Putar Otomatis"
            description="Otomatis memutar episode selanjutnya"
            action={
              <ToggleSwitch
                isChecked={preferences.autoplay}
                onChange={() =>
                  updatePreference({ autoplay: !preferences.autoplay })
                }
              />
            }
          />
          <SettingsItem
            title="Bahasa Aplikasi"
            action={
              <SelectBox
                value={preferences.language}
                onChange={(e: any) =>
                  updatePreference({ language: e.target.value })
                }
                options={["Bahasa Indonesia", "English", "日本語", "Español"]}
              />
            }
          />
          <SettingsItem
            title="Bahasa Subtitle Default"
            action={
              <SelectBox
                value={preferences.subtitleLanguage}
                onChange={(e: any) =>
                  updatePreference({ subtitleLanguage: e.target.value })
                }
                options={["Bahasa Indonesia", "English", "Off"]}
              />
            }
            isLast
          />
        </div>
      </SectionContainer>

      {/* --- Section 5: Notifikasi --- */}
      <SectionContainer>
        <SectionHeading
          icon={<Bell size={20} />}
          title="Pengaturan Notifikasi"
        />
        <div className="space-y-1">
          <SettingsItem
            title="Email Newsletter"
            description="Berita terbaru dan promo eksklusif"
            action={
              <ToggleSwitch
                isChecked={preferences.notifications.email}
                onChange={() => toggleNotification("email")}
              />
            }
          />
          <SettingsItem
            title="Notifikasi Push"
            description="Pemberitahuan langsung di perangkat"
            action={
              <ToggleSwitch
                isChecked={preferences.notifications.push}
                onChange={() => toggleNotification("push")}
              />
            }
          />
          <SettingsItem
            title="Rekomendasi Film"
            description="Saran tontonan sesuai seleramu"
            action={
              <ToggleSwitch
                isChecked={preferences.notifications.recommendations}
                onChange={() => toggleNotification("recommendations")}
              />
            }
            isLast
          />
        </div>
      </SectionContainer>

      {/* --- Section 6: Preferensi Konten --- */}
      <SectionContainer>
        <SectionHeading
          icon={<Film size={20} />}
          title="Personalisasi Konten"
        />
        <div className="mb-6">
          <h3 className="text-gray-300 font-medium mb-3 text-sm">
            Genre Favorit
          </h3>
          <div className="flex flex-wrap gap-2">
            {genres.map((genre) => (
              <button
                key={genre.id}
                onClick={() => handleGenreToggle(genre.name)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                  preferences.favoriteGenres.includes(genre.name)
                    ? "bg-green-600 text-white shadow-lg shadow-green-900/50 hover:bg-green-500"
                    : "bg-[#333333] text-gray-100 hover:bg-green-600 border border-gray-700"
                }`}
              >
                {genre.name}
              </button>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-gray-300 font-medium mb-3 text-sm">
            Rating Usia
          </h3>
          <div className="inline-flex bg-[#333333] p-1 rounded-lg border border-gray-700">
            {["Semua Umur", "13+", "18+"].map((rating) => (
              <button
                key={rating}
                onClick={() => updatePreference({ maturityRating: rating })}
                className={`px-4 py-1.5 rounded-md text-sm transition-all ${
                  preferences.maturityRating === rating
                    ? "bg-green-600 text-white shadow-sm"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                {rating}
              </button>
            ))}
          </div>
        </div>
      </SectionContainer>

      {/* --- Links Footer --- */}
      <div className="grid grid-cols-2 gap-4 mt-8 opacity-70">
        <Link
          href="/help"
          className="block p-4 bg-[#333333] rounded-lg hover:bg-[#555555] text-center text-sm"
        >
          Pusat Bantuan
        </Link>
        <Link
          href="/terms"
          className="block p-4 bg-[#333333] rounded-lg hover:bg-[#555555] text-center text-sm"
        >
          Syarat & Ketentuan
        </Link>
      </div>
    </div>
  );
}

// --- UI Components ---

const SectionContainer = ({ children }: { children: React.ReactNode }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-[#151515] rounded-2xl p-6 mb-6 border border-white/5 shadow-xl"
  >
    {children}
  </motion.div>
);

const SectionHeading = ({
  icon,
  title,
}: {
  icon: React.ReactNode;
  title: string;
}) => (
  <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-gray-800">
    <div className="text-green-500 bg-green-500/10 p-2 rounded-lg">{icon}</div>
    <h2 className="text-lg font-semibold text-white">{title}</h2>
  </div>
);

const InputField = ({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) => (
  <div>
    <label className="block text-xs text-gray-400 mb-1.5 font-medium uppercase tracking-wide">
      {label}
    </label>
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full bg-[#333333] rounded-lg px-4 py-2.5 text-white border border-gray-700 focus:border-green-500 focus:ring-1 focus:ring-green-500 focus:outline-none transition-all"
    />
  </div>
);

const PasswordInput = ({ label, value, show, onChange, onToggle }: any) => (
  <div>
    <label className="block text-xs text-gray-400 mb-1.5 font-medium uppercase tracking-wide">
      {label}
    </label>
    <div className="relative">
      <input
        type={show ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-[#333333] rounded-lg px-4 py-2.5 text-white border border-gray-700 focus:border-green-500 focus:ring-1 focus:ring-green-500 focus:outline-none"
      />
      <button
        type="button"
        onClick={onToggle}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
      >
        {show ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  </div>
);

const ToggleSwitch = ({
  isChecked,
  onChange,
}: {
  isChecked: boolean;
  onChange: () => void;
}) => (
  <div
    className={`relative w-11 h-6 rounded-full transition-colors duration-200 cursor-pointer ${
      isChecked ? "bg-green-600" : "bg-[#333333]"
    }`}
    onClick={onChange}
  >
    <motion.div
      className="absolute w-4 h-4 bg-white rounded-full top-1 left-1 shadow-sm"
      animate={{ x: isChecked ? 20 : 0 }}
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
    />
  </div>
);

const SelectBox = ({ value, onChange, options }: any) => (
  <select
    value={value}
    onChange={onChange}
    className="bg-[#333333] text-white text-sm rounded-lg px-3 py-2 border border-gray-700 focus:outline-none focus:border-green-500"
  >
    {options.map((opt: string) => (
      <option key={opt} value={opt}>
        {opt}
      </option>
    ))}
  </select>
);

const SettingsItem = ({ title, description, action, isLast = false }: any) => (
  <div
    className={`flex justify-between items-center py-4 ${
      !isLast && "border-b border-gray-800"
    }`}
  >
    <div className="pr-4">
      <h3 className="font-medium text-gray-200">{title}</h3>
      {description && (
        <p className="text-xs text-gray-500 mt-0.5">{description}</p>
      )}
    </div>
    <div className="flex-shrink-0">{action}</div>
  </div>
);
