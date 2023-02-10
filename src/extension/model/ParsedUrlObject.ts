import 'reflect-metadata';
import { instanceToPlain, plainToClass } from 'class-transformer';


export class ParsedUrl {
    volume_no: string | undefined;
    authors: string | undefined;
    author_count: string | undefined;
    title: string | undefined;
    publication_type: string | undefined;
    page_no: string | undefined;
    link: string | undefined;
    display_string: string | undefined;

    toPlainObject(): Object {
        return instanceToPlain(this);
    }

    static parsePlainObject(obj: Object): ParsedUrl {
        return plainToClass(ParsedUrl, obj);
    }

}




