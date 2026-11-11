import VOTClient from "@vot.js/core/client";
import { VOTNextWorkerProvider } from "@vot.js/core/providers/votworker";

window.VOTBrowser = {
  createClient(host = "vot-worker.toil.cc") {
    return new VOTClient({
      provider: VOTNextWorkerProvider,
      host,
    });
  },
};
