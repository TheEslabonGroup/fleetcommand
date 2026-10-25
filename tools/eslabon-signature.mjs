// Pinned Eslabon signature from https://github.com/TheEslabonGroup/eslabon-signature
import {signatureMarkup} from './eslabon-signature-markup.mjs';
export const signatureBase="/assets/eslabon-signature/v001-b559f76c975c";
export const footerSignature=()=>signatureMarkup("titanium",signatureBase);
export const signatureAssets={css:'<link data-eslabon-assets="css" rel="stylesheet" href="'+signatureBase+'/signature.css">',js:'<script data-eslabon-assets="js" type="module" src="'+signatureBase+'/signature.mjs"></script>'};
