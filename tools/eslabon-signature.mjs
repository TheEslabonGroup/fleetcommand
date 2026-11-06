// Pinned Eslabon signature from https://github.com/TheEslabonGroup/eslabon-signature
import {signatureMarkup} from './eslabon-signature-markup.mjs';
export const signatureBase="/assets/eslabon-signature/v001-db87eb241765";
export const footerSignature=()=>signatureMarkup("titanium",signatureBase);
export const signatureAssets={css:'<link data-eslabon-assets="css" rel="stylesheet" href="'+signatureBase+'/signature.css">',js:'<script data-eslabon-assets="js" type="module" src="'+signatureBase+'/signature.mjs"></script>'};
