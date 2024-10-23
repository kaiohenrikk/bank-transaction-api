import { Module, DynamicModule, Provider } from '@nestjs/common';
import { Type } from '@nestjs/common/interfaces';
import { promises as fs } from 'fs';
import { join, resolve } from 'path';

@Module({})
export class DynamicModuleLoader {
  static async register(): Promise<DynamicModule> {
    // eslint-disable-next-line  @typescript-eslint/no-explicit-any
    const controllers: Type<any>[] = [];
    const providers: Provider[] = [];

    // eslint-disable-next-line no-undef
    const modulesDir = resolve(__dirname, './modules');

    try {
      const moduleFolders = await fs.readdir(modulesDir);

      const moduleFoldersPromises: Promise<void>[] = [];

      moduleFolders.forEach((folder) => {
        const promise = this.loadModule(
          folder,
          modulesDir,
          controllers,
          providers
        );
        moduleFoldersPromises.push(promise);
      });

      await Promise.all(moduleFoldersPromises);
    } catch (err) {
      console.warn(`Could not read modules directory: ${modulesDir}`, err);
    }

    return {
      module: DynamicModuleLoader,
      controllers,
      providers,
      exports: providers,
    };
  }

  private static async loadModule(
    folder: string,
    modulesDir: string,
    // eslint-disable-next-line  @typescript-eslint/no-explicit-any
    controllers: Type<any>[],
    providers: Provider[]
  ): Promise<void> {
    const controllerDir = join(modulesDir, folder, 'controller');
    const providerDir = join(modulesDir, folder, 'service');

    await this.loadControllers(controllerDir, controllers);
    await this.loadProviders(providerDir, providers);
  }

  private static async loadControllers(
    controllerDir: string,
    // eslint-disable-next-line  @typescript-eslint/no-explicit-any
    controllers: Type<any>[]
  ): Promise<void> {
    try {
      const controllerFiles = await fs.readdir(controllerDir);

      // eslint-disable-next-line  @typescript-eslint/no-explicit-any
      const controllerPromises: Promise<{ default: Type<any> }>[] = [];

      controllerFiles.forEach((file) =>
        controllerPromises.push(import(join(controllerDir, file)))
      );

      const importedControllers = await Promise.all(controllerPromises);

      importedControllers.forEach(({ default: controller }) => {
        controllers.push(controller);
      });
      // eslint-disable-next-line  @typescript-eslint/no-explicit-any
    } catch (err: any) {
      if (err.code !== 'ENOENT') {
        console.warn(`Could not read directory: ${controllerDir}`, err);
      }
    }
  }

  private static async loadProviders(
    providerDir: string,
    providers: Provider[]
  ): Promise<void> {
    try {
      const providerFiles = await fs.readdir(providerDir);

      const providerPromises: Promise<{ default: Provider }>[] = [];

      providerFiles.forEach((file) =>
        providerPromises.push(import(join(providerDir, file)))
      );

      const importedProviders = await Promise.all(providerPromises);

      importedProviders.forEach(({ default: provider }) => {
        providers.push(provider);
      });
      // eslint-disable-next-line  @typescript-eslint/no-explicit-any
    } catch (err: any) {
      if (err.code !== 'ENOENT') {
        console.warn(`Could not read directory: ${providerDir}`, err);
      }
    }
  }
}
