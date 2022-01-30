import { SocialLinkInterface } from '../interfaces/social-link.interface';

const SocialLinks: Array<SocialLinkInterface> = [
    {
        label: 'Youtube',
        link: 'https://m.youtube.com',
        caption: '@youtube',
        icon: 'logo/youtube.png',
        mobileOnly: true
    },
    {
        label: 'Facebook',
        link: 'https://m.facebook.com',
        caption: '@facebook',
        icon: 'logo/facebook.png',
        mobileOnly: true
    },
   /* {
        label: 'Google',
        link: 'https://www.google.com',
        caption: '@google',
        icon: 'logo/google.png',
        mobileOnly: true
    }*/
];

export default SocialLinks;
