import {afterEach,expect,it} from 'vitest';
import {mkdir,symlink} from 'node:fs/promises';
import {resolve} from 'node:path';
import {windowsAttributes} from '../../scripts/site-windows-attributes';
import {cleanPreparationFixtures,fixtureRoots} from '../helpers/site-preparation';
import {mkdtemp} from 'node:fs/promises';
afterEach(cleanPreparationFixtures);
it.skipIf(process.platform!=='win32')('reads_actual_windows_attributes_without_following_a_junction',async()=>{
 await mkdir(resolve('.tmp'),{recursive:true});const home=await mkdtemp(resolve('.tmp/site-preparation-tests-'));fixtureRoots.push(home);
 const directory=resolve(home,'directory'),junction=resolve(home,'junction');await mkdir(directory);await symlink(directory,junction,'junction');
 const values=await windowsAttributes([directory,junction]);expect(values).toHaveLength(2);expect(values[0]&1024).toBe(0);expect(values[1]&1024).toBe(1024);
 await expect(windowsAttributes([resolve(home,'missing')])).rejects.toThrow(/attributes/);
});
