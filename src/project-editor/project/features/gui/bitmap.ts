import { observable, action } from "mobx";

import { validators } from "shared/model/validation";

import { showGenericDialog } from "shared/ui/generic-dialog";

import { ProjectStore } from "project-editor/core/store";
import { EezObject, registerMetaData } from "project-editor/core/metaData";

import { RelativeFileInput } from "project-editor/components/RelativeFileInput";

import { ListNavigationWithContent } from "project-editor/project/ListNavigation";

import { BitmapEditor } from "project-editor/project/features/gui/BitmapEditor";
import { getStyleProperty } from "project-editor/project/features/gui/style";

let fs = EEZStudio.electron.remote.require("fs");

export class BitmapProperties extends EezObject {
    @observable name: string;
    @observable description?: string;
    @observable image: string;
    @observable style?: string;

    private imageElementLoading: boolean = false;
    @observable private _imageElement: HTMLImageElement | null = null;

    get imageElement() {
        if (!this._imageElement && !this.imageElementLoading) {
            this.imageElementLoading = true;
            let imageElement = new Image();
            imageElement.src = this.image;
            imageElement.onload = action(() => {
                this._imageElement = imageElement;
            });
        }
        return this._imageElement;
    }
}

export const bitmapMetaData = registerMetaData({
    getClass: function(jsObject: any) {
        return BitmapProperties;
    },
    className: "Bitmap",
    label: (bitmap: BitmapProperties) => {
        return bitmap.name;
    },
    properties: () => [
        {
            name: "name",
            type: "string",
            unique: true
        },
        {
            name: "description",
            type: "multiline-text"
        },
        {
            name: "image",
            type: "image",
            hideInPropertyGrid: true,
            skipSearch: true
        },
        {
            name: "style",
            type: "object-reference",
            referencedObjectCollectionPath: ["gui", "styles"]
        }
    ],
    newItem: (parent: EezObject) => {
        return showGenericDialog({
            dialogDefinition: {
                title: "New Bitmap",
                fields: [
                    {
                        name: "name",
                        type: "string",
                        validators: [validators.required, validators.unique({}, parent)]
                    },
                    {
                        name: "imageFilePath",
                        displayName: "Image",
                        type: RelativeFileInput,
                        validators: [validators.required],
                        options: {
                            filters: [
                                { name: "PNG Image files", extensions: ["png"] },
                                { name: "All Files", extensions: ["*"] }
                            ]
                        }
                    }
                ]
            },
            values: {}
        }).then(result => {
            return new Promise<BitmapProperties>((resolve, reject) => {
                fs.readFile(
                    ProjectStore.getAbsoluteFilePath(result.values.imageFilePath),
                    "base64",
                    (err: any, data: any) => {
                        if (err) {
                            reject(err);
                        } else {
                            let newBitmap: BitmapProperties = <any>{
                                name: result.values.name,
                                image: "data:image/png;base64," + data
                            };

                            resolve(newBitmap);
                        }
                    }
                );
            });
        });
    },
    editorComponent: BitmapEditor,
    navigationComponent: ListNavigationWithContent,
    navigationComponentId: "bitmaps",
    icon: "image"
});

export interface BitmapData {
    width: number;
    height: number;
    pixels: number[];
}

export function getData(bitmap: BitmapProperties): Promise<BitmapData> {
    return new Promise((resolve, reject) => {
        let image = new Image();

        image.src = bitmap.image;

        image.onload = () => {
            let canvas = document.createElement("canvas");
            canvas.width = image.width;
            canvas.height = image.height;

            let ctx = <CanvasRenderingContext2D>canvas.getContext("2d");

            ctx.fillStyle = getStyleProperty(bitmap.style, "backgroundColor");
            ctx.fillRect(0, 0, image.width, image.height);

            ctx.drawImage(image, 0, 0);

            let imageData = ctx.getImageData(0, 0, image.width, image.height).data;

            let pixels: number[] = [];
            for (let i = 0; i < 4 * image.width * image.height; i += 4) {
                let r = imageData[i];
                let g = imageData[i + 1];
                let b = imageData[i + 2];

                // rrrrrggggggbbbbb
                pixels.push(((g & 28) << 3) | (b >> 3));
                pixels.push((r & 248) | (g >> 5));
            }

            resolve({
                width: image.width,
                height: image.height,
                pixels: pixels
            });
        };

        image.onerror = () => {
            reject();
        };
    });
}
