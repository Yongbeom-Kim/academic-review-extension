import 'reflect-metadata';
import { instanceToPlain, plainToClass } from 'class-transformer';


export class ParsedUrl {
    authors: string | undefined;
    title: string | undefined;
    publication_type: string | undefined;
    pages: string | undefined;
    link: string | undefined;
    display_string: string | undefined;

    toPlainObject(): Object {
        return instanceToPlain(this);
    }

    /**
     * We need this method because things like links have issue when exported to csv (for some reason?)
     */
    toExportableObject(): Record<any, any> {
        return (({authors, title, publication_type, pages}) => ({authors, title, publication_type, pages}))(this)
    }

    static parsePlainObject(obj: Object): ParsedUrl {
        return plainToClass(ParsedUrl, obj);
    }

}




