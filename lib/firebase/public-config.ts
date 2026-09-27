export const firebasePublicConfig = {
  apiKey: "AIzaSyD_1jiMpoC4el-JwzJXil8yNykA258LurM",
  authDomain: "x-cds-502821.firebaseapp.com",
  projectId: "x-cds-502821",
  appId: "1:342857978337:web:c3b76ba71cef8c043782a0",
};

/** Public OAuth client "EaseITR Custom". The secret stays in Google Cloud. */
export const googleClientId =
  "342857978337-7snvlfkcnjcrs7ldd2i7n6k3urpeb026.apps.googleusercontent.com";

/** Cloud Run API in Mumbai. A build can override this with NEXT_PUBLIC_EASEITR_API_URL. */
export const apiBaseUrl =
  process.env.NEXT_PUBLIC_EASEITR_API_URL ||
  "https://easeitr-api-342857978337.asia-south1.run.app";
