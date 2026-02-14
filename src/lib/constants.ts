export const SITE_NAME = 'El Taco Chingon';
export const SITE_DESCRIPTION = 'Authentic Mexican Street Food in Fresno, CA';
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export const TAX_RATE = 0.0835; // 8.35% Fresno, CA sales tax rate (CDTFA effective 01/01/2026)

export const BUSINESS_INFO = {
  name: 'El Taco Chingon',
  phone: '(559) 417-7907',
  email: 'contact@eltacochingon.com',
  address: {
    street: '3649 N Blackstone Ave',
    city: 'Fresno',
    state: 'CA',
    zip: '93726',
  },
};

export const SOCIAL_LINKS = {
  instagram: 'https://instagram.com/eltacochingon',
  facebook: 'https://facebook.com/eltacochingon',
  yelp: 'https://www.yelp.com/biz/el-taco-chingon-fresno-3',
};

export const ORDER_LINKS = {
  doordash: 'https://www.doordash.com/store/el-taco-chingon-llc-fresno-26306243/',
  ubereats: 'https://www.ubereats.com/store/el-taco-chingon-llc/fEXGG2lERMmPbgQPD5zR5w',
  direct: 'https://order.online/store/ElTacoChingonLLC-26306243?hideModal=true&pickup=true',
};

export const REVIEW_LINKS = {
  yelp: 'https://www.yelp.com/writeareview/biz/nJu5rhGhMgEF2If4lFL-vQ?return_url=%2Fbiz%2FnJu5rhGhMgEF2If4lFL-vQ&review_origin=biz-details-war-button',
  google: 'https://search.google.com/local/writereview?placeid=ChIJ1d4PAildlIARUPcn-tQraEo',
};
