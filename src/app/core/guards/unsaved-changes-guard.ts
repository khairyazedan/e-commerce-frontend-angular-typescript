import { CanDeactivateFn } from '@angular/router';
import { IUnsavedChanges } from '../models/unsavedChanges.model';

export const unsavedChangesGuard: CanDeactivateFn<IUnsavedChanges | null> = (
  component,
  currentRoute,
  currentState,
  nextState,
) => {
  return component?.canDeactivate ? component?.canDeactivate() : true;
};
