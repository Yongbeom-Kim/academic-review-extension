import 'reflect-metadata';
import { instanceToPlain, plainToClass } from 'class-transformer';


export class ParsedUrl {
    volume_no: string = "";
    authors: string = "";
    author_count: number = 0;
    title: string = "";
    publication_type: string = "";
    page_no: string = "";
    link: string = "";
    display_string: string = "";

    toPlainObject(): Object {
        return instanceToPlain(this);
    }

    static parsePlainObject(obj: Object): ParsedUrl {
        return plainToClass(ParsedUrl, obj);
    }

    private constructor() { }

    public static from
        ({
            volume_no,
            authors,
            author_count,
            title,
            publication_type,
            page_no,
            link
        }): ParsedUrl {
        let newObj = new ParsedUrl();

        newObj.volume_no = volume_no;
        newObj.authors = authors;
        newObj.title = title;
        newObj.publication_type = publication_type;
        newObj.page_no = page_no;
        newObj.link = link
        newObj.author_count = author_count;
        
        newObj.setDisplayString();
        return newObj;
    }

    private setDisplayString() {
        this.display_string = this.title ?? this.authors;
    }

}



