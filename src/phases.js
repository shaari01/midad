// Each build phase registers its tools, geometry and panel sections here.
import * as phase2 from './phase2.js';

export async function loadPhases(app) {
  phase2.install(app);
}
