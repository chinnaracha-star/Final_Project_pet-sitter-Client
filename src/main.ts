import { createApp } from "vue";
import "./style.css";
import App from "./App.vue";
import { createPinia } from "pinia";
import router from "./router";
import 'leaflet/dist/leaflet.css'
import { useAuthStore } from "./stores/auth";

const app = createApp(App);
const pinia = createPinia();
app.use(pinia);

const auth = useAuthStore();
await auth.restore();

app.use(router);
app.mount("#app");
