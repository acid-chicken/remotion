(self.webpackChunkdocs=self.webpackChunkdocs||[]).push([[9061],{3905:function(e,t,r){"use strict";r.r(t),r.d(t,{MDXContext:function(){return c},MDXProvider:function(){return d},mdx:function(){return f},useMDXComponents:function(){return m},withMDXComponents:function(){return l}});var o=r(2784);function n(e,t,r){return t in e?Object.defineProperty(e,t,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[t]=r,e}function i(){return(i=Object.assign||function(e){for(var t=1;t<arguments.length;t++){var r=arguments[t];for(var o in r)Object.prototype.hasOwnProperty.call(r,o)&&(e[o]=r[o])}return e}).apply(this,arguments)}function a(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);t&&(o=o.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),r.push.apply(r,o)}return r}function s(e){for(var t=1;t<arguments.length;t++){var r=null!=arguments[t]?arguments[t]:{};t%2?a(Object(r),!0).forEach((function(t){n(e,t,r[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):a(Object(r)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(r,t))}))}return e}function u(e,t){if(null==e)return{};var r,o,n=function(e,t){if(null==e)return{};var r,o,n={},i=Object.keys(e);for(o=0;o<i.length;o++)r=i[o],t.indexOf(r)>=0||(n[r]=e[r]);return n}(e,t);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(o=0;o<i.length;o++)r=i[o],t.indexOf(r)>=0||Object.prototype.propertyIsEnumerable.call(e,r)&&(n[r]=e[r])}return n}var c=o.createContext({}),l=function(e){return function(t){var r=m(t.components);return o.createElement(e,i({},t,{components:r}))}},m=function(e){var t=o.useContext(c),r=t;return e&&(r="function"==typeof e?e(t):s(s({},t),e)),r},d=function(e){var t=m(e.components);return o.createElement(c.Provider,{value:t},e.children)},p={inlineCode:"code",wrapper:function(e){var t=e.children;return o.createElement(o.Fragment,{},t)}},h=o.forwardRef((function(e,t){var r=e.components,n=e.mdxType,i=e.originalType,a=e.parentName,c=u(e,["components","mdxType","originalType","parentName"]),l=m(r),d=n,h=l["".concat(a,".").concat(d)]||l[d]||p[d]||i;return r?o.createElement(h,s(s({ref:t},c),{},{components:r})):o.createElement(h,s({ref:t},c))}));function f(e,t){var r=arguments,n=t&&t.mdxType;if("string"==typeof e||n){var i=r.length,a=new Array(i);a[0]=h;var s={};for(var u in t)hasOwnProperty.call(t,u)&&(s[u]=t[u]);s.originalType=e,s.mdxType="string"==typeof e?e:n,a[1]=s;for(var c=2;c<i;c++)a[c]=r[c];return o.createElement.apply(null,a)}return o.createElement.apply(null,r)}h.displayName="MDXCreateElement"},51548:function(e,t,r){"use strict";r.r(t),r.d(t,{frontMatter:function(){return u},contentTitle:function(){return c},metadata:function(){return l},assets:function(){return m},toc:function(){return d},default:function(){return h}});var o=r(22122),n=r(19756),i=(r(2784),r(3905)),a=r(84420),s=["components"],u={slug:"makestories",title:"How MakeStories uses Remotion to render Web Stories",image:"/img/makestories.png"},c=void 0,l={permalink:"/success-stories/makestories",source:"@site/success-stories/2021-09-16-makestories.md",title:"How MakeStories uses Remotion to render Web Stories",description:"This is the first article in our new series: Success Stories. We interview companies and creators that we find inspiring and which have successfully implemented Remotion in their stack. Let us know what you think!",date:"2021-09-16T00:00:00.000Z",formattedDate:"September 16, 2021",tags:[],readingTime:2.895,truncated:!1,authors:[]},m={authorsImageUrls:[]},d=[],p={toc:d};function h(e){var t=e.components,u=(0,n.default)(e,s);return(0,i.mdx)("wrapper",(0,o.default)({},p,u,{components:t,mdxType:"MDXLayout"}),(0,i.mdx)("p",null,(0,i.mdx)("em",{parentName:"p"},"This is the first article in our new series: Success Stories. We interview companies and creators that we find inspiring and which have successfully implemented Remotion in their stack. Let us know what you think!")),(0,i.mdx)("p",null,"MakeStories is in the business of ",(0,i.mdx)("a",{parentName:"p",href:"https://stories.google/"},"Web Stories")," - a format by Google to bring stories to the web. Appearing directly in Google Search, they are an opportunity for publishers to increase their audience massively."),(0,i.mdx)(a.MuxVideo,{muxId:"eB9pPF17zyOrmEas4kwsa3OvTeQV3cDlLQ5U01CHrfcg",style:{width:"100%"},controls:!0,poster:"/img/makestories.png",mdxType:"MuxVideo"}),(0,i.mdx)("p",{align:"center"},(0,i.mdx)("em",null,"MakeStories founder Pratik Ghela explains how they built a Remotion rendering service to export Web Stories to MP4s.")),(0,i.mdx)("p",null,"These stories are powered using web technology, meaning they are built using HTML and CSS. One of the most popular tools for publishers to quickly create Web Stories is ",(0,i.mdx)("a",{parentName:"p",href:"https://makestories.io/"},"MakeStories.io"),". We are talking to founder Pratik Ghela\nabout how they are using Remotion to allow publishers to export their videos as real MP4 videos."),(0,i.mdx)("p",null,(0,i.mdx)("strong",{parentName:"p"},"Hi Pratik! Pitch us MakeStories really quick.")),(0,i.mdx)("p",null,"MakeStories is a web based tool where you can create stories for websites. For context: Google has a product called Web Stories. These stories are on the web and not the same stories as you know from social media where you just can take pictures and upload them to your storyline. These Web Stories need to be written in HTML and CSS which is the tough part. What we did is we built a tool called MakeStories which has a drag, drop & click approach. What you can do essentially is using our simplified approach to create animations. By using MakeStories to create your own web stories you get the necessary HTML and CSS code of your story. This is used to put your story for example on Google Discover or on your own website."),(0,i.mdx)("p",null,(0,i.mdx)("strong",{parentName:"p"},"How are you using Remotion for MakeStories?")),(0,i.mdx)("p",null,"We started to build a Web Story builder for social media. For that reason we were looking for a rendering engine and that was when we came across Remotion. Now a Web Story created on MakeStories is compatible with any platform - Google as well as social media."),(0,i.mdx)("p",null,(0,i.mdx)("img",{alt:"Screenshot of MakeStories&#39; export feature",src:r(26385).Z})),(0,i.mdx)("p",{align:"center"},(0,i.mdx)("em",null,"MakeStories customers get two options to export their stories - either in AMP format to publish on Google or as MP4 to post to social media.")),(0,i.mdx)("p",null,(0,i.mdx)("strong",{parentName:"p"},"Why did you decide to implement the feature in Remotion?")),(0,i.mdx)("p",null,"A big challenge we had before was the rendering time. We used to work with another service but it was not a scalable solution. Even though a story has up to ten slides, the rendering process is smooth and done within one minute, which is a huge improvement for us."),(0,i.mdx)("p",null,"Considering this is a better product than we used before, everything was perfect for us. With Remotion we were able to minimize the rendering time which was a big challenge for us prior to the implementation."),(0,i.mdx)("p",null,(0,i.mdx)("strong",{parentName:"p"},"Were there any difficulties when integrating Remotion?")),(0,i.mdx)("p",null,"The integration of Remotion was straightforward. The documentation on the website was good and gave us guidance throughout the whole process.\nAnother good thing for us was that Remotion uses TypeScript since we already used it before we were already familiar with it. This made many things easier for us. And even some minor quality issues we had before are gone now.\n",(0,i.mdx)("em",{parentName:"p"},"Editors note: MakeStories consulted with Remotion on how to optimize render time and quality for their stories.")),(0,i.mdx)("hr",null),(0,i.mdx)("p",null,(0,i.mdx)("em",{parentName:"p"},"Were you successful using Remotion? Let us know your story at ",(0,i.mdx)("a",{parentName:"em",href:"mailto:hi@remotion.dev"},"hi@remotion.dev"),"!")))}h.isMDXComponent=!0},84420:function(e,t,r){"use strict";var o=r(95318).default,n=r(20862).default;Object.defineProperty(t,"__esModule",{value:!0}),t.MuxVideo=void 0;var i=o(r(22122)),a=o(r(19756)),s=o(r(67631)),u=n(r(2784)),c=["muxId"],l=function(e,t){var r=e.muxId,o=(0,a.default)(e,c),n=(0,u.useRef)(null),l=function(e){return"https://stream.mux.com/"+e+".m3u8"}(r);return(0,u.useImperativeHandle)(t,(function(){return n.current})),(0,u.useEffect)((function(){var e;if(n.current){var t=n.current;t.canPlayType("application/vnd.apple.mpegurl")?t.src=l:s.default.isSupported()?((e=new s.default).loadSource(l),e.attachMedia(t)):console.error("This is a legacy browser that doesn't support MSE")}return function(){e&&e.destroy()}}),[l,n]),u.default.createElement("video",(0,i.default)({ref:n},o))},m=(0,u.forwardRef)(l);t.MuxVideo=m},26385:function(e,t,r){"use strict";t.Z=r.p+"assets/images/makestories-export-6b49069b1c66ba64dfc42df070551462.png"}}]);