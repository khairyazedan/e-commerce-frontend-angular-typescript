import { Observable } from "rxjs";

export interface IUnsavedChanges{
    canDeactivate : ()=> boolean | Promise<boolean> | Observable<boolean>;
}