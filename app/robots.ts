import { MetadataRoute } from "next";

export default function robots():MetadataRoute.Robots{
    return {
        rules:{
            userAgent:'*',
            allow:'/,/home,/signin, /signup',
            disallow:'/api/*'
        },
        sitemap:'https://mediatools.site/sitemap.xml',
    }
}