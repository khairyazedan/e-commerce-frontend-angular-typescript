import { Pipe, PipeTransform } from "@angular/core";



@Pipe({
    name: 'nospace'
})

export class Nospace implements PipeTransform{
    transform(value: any, ...args: any[]) {
        return value.replaceAll(' '), ("");
    }
}