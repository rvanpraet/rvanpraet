import ddw01Image from '@/assets/images/projects/depth-array/DDW_01.jpg'
import ddw02Image from '@/assets/images/projects/depth-array/DDW_02.jpg'
import ddw03Image from '@/assets/images/projects/depth-array/DDW_03.jpg'
import americanaImage from '@/assets/images/projects/americana/americana_01.jpg'
import americanaImage02 from '@/assets/images/projects/americana/americana_02.jpg'
import americanaImage03 from '@/assets/images/projects/americana/americana_03.jpg'

const projectsOverviewData = {
  slug: undefined,
  title: 'Projects',
  data: null,
}

const depthArrayData = {
  slug: 'depth-array-reflections',
  title: 'Depth Array: Reflections',
  data: {
    header: {
      title: 'Depth Array: Reflections',
      subtitle: 'Audiovisual art installation',
      image: {
        src: ddw01Image,
        alt: 'Depth Array: Reflections - Hero Image',
      },
      metadata: {
        client: 'Client - Robin Beekman',
        roles: ['Creative Coding', 'Sound Design'],
        location: 'Dutch Design Week 2024',
        website: 'https://www.koelhuiseindhoven.nl/post/depth-array-reflections-by-robin-beekman',
      },
    },
    blocks: [
      {
        type: 'content-block',
        content: `<p><em>Depth Array - Reflections</em> is an immersive, site-specific installation located in the basement of Koelhuis Eindhoven. This 360-degree audiovisual environment investigates the nuances of depth perception and spatial awareness.<br /><br />Custom-built light fixtures generate shifting planes of illumination, their rhythm and intensity evolving in response to subtle sonic movements. As light and sound converge, fleeting after-images and resonant vibrations coalesce into a perceptual interplay that challenges orientation.<br /><br />Within this field of shifting stimuli, distinctions between surface and space, vision and sensation, gradually dissolve—leaving the viewer suspended in an ever-reforming sense of depth.</p>`,
        props: null,
      },
      {
        type: 'content-image',
        content: `<figcaption>Credit - Riccardo de Vecchi</figcaption>`,
        props: {
          variant: 'left',
          image: {
            variant: 'landscape',
            src: ddw02Image,
            alt: 'Depth Array: Reflections - Exhibition Image',
          },
        },
      },
      {
        type: 'content-image',
        content: `<figcaption>Credit - Riccardo de Vecchi</figcaption>`,
        props: {
          variant: 'right',
          image: {
            variant: 'landscape',
            src: ddw03Image,
            alt: 'Depth Array: Reflections - Exhibition Image',
          },
          class: 'mt-16!',
        },
      },
      {
        type: 'content-block',
        content: `<h2>Process</h2><p>Behind the installation lies a process of sonic and visual experimentation aimed at merging perception and space into a single, responsive environment.<br /><br />
The sound design for <em>Depth Array - Reflections</em> was developed using modular synthesis and a range of outboard processing techniques to create a deeply immersive sonic atmosphere. A 15-minute audio loop was composed from layered long-form recordings, evolving slowly to complement the spatial and visual dynamics of the installation.
<br /><br />The choreography of light was precisely synchronized to the sound using Ableton and TouchDesigner, integrating audio-reactive elements with generative behaviors to achieve a sense of organic movement. A twelve-channel speaker array distributed sound throughout the space, allowing both light and audio to traverse the room and shape the perception of depth from every angle.`,
        props: null,
      },
      {
        type: 'content-video',
        content: null,
        props: {
          url: 'https://player.vimeo.com/video/1125454072?title=0&byline=0&portrait=0',
          title: 'Depth Array - Reflections by Robin Beekman',
        },
      },
    ],
  },
}

const americanaData = {
  slug: 'americana',
  title: 'Americana',
  data: {
    header: {
      title: 'Americana',
      subtitle: 'Interactive library collection',
      image: {
        src: americanaImage,
        alt: 'Americana - Hero Image',
      },
      metadata: {
        client: 'Agency - Fabrique',
        roles: ['Frontend Development'],
        // location: 'Dutch Design Week 2024',
        website: 'https://www.americana.jcblibrary.org',
      },
    },
    blocks: [
      {
        type: 'content-block',
        content: `<p>Americana is part of The John Carter Brown Library, which began as a private collection in 1846. Today, it holds one of the world’s most remarkable collections of over 75,000 rare books, maps, and manuscripts. We developed a single platform to bring the entire collection together.<br /><br />More than two hundred languages and over three centuries of early American history are represented in the library. The digital platform for this collection, called Americana, goes beyond preservation. It enables people to collaborate, share knowledge, and discover new insights. With Americana, the entire digital collection has found a single home — a place that supports both focused research and open exploration. Even items that have not yet been digitized are included on the platform.</p>`,
        props: null,
      },
      {
        type: 'content-image',
        content: `<figcaption>Americana digital collection</figcaption>`,
        props: {
          variant: 'left',
          image: {
            variant: 'landscape',
            src: americanaImage02,
            alt: 'Americana digital collection homepage image',
          },
        },
      },
      {
        type: 'content-block',
        content: `<h2>Living Collection</h2><p>Alongside its powerful search capabilities, the platform brings the Americana collection to life by allowing users to annotate, create projects, and publish their research. It fosters collaboration and discussion, enriching the collection with new layers of knowledge. It is a place where curious minds meet.</p>`,
        props: null,
      },
      {
        type: 'content-image',
        content: `<figcaption>Annotate digital items and add them to your research</figcaption>`,
        props: {
          variant: 'right',
          image: {
            variant: 'landscape',
            src: americanaImage03,
            alt: 'Americana digital item view and annotation page',
          },
        },
      },
      {
        type: 'content-block',
        content: `<h2>Discover with ease</h2><p>As the platform offers a wide range of advanced features, it is essential that the interfaces for these tools do not overwhelm users. The user interface adapts to each task, helping users stay focused on what they want to accomplish.<br /><br />As a front-end developer, I collaborated closely with the design team to translate complex functionality into a clear and intuitive experience. Together, we refined interaction patterns, visual hierarchy, and responsive behavior to ensure that the platform remained accessible and fluid, even as it supported advanced research tools and diverse user needs.</p>`,
        props: null,
      },
      {
        type: 'content-video',
        content: null,
        props: {
          url: 'https://player.vimeo.com/video/852608203?title=0&byline=0&portrait=0&speed=0&color=ffffff&muted=1&autoplay=1&autopause=0&loop=1&background=1&app_id=122963',
          title: 'Americana overview video',
        },
      },
    ],
  },
}

export default [
  projectsOverviewData,
  depthArrayData,
  americanaData,
  // {
  //   slug: 'americana',
  //   title: 'Americana',
  //   text: 'If you want to learn Astro, you must read this book.',
  // },
  // {
  //   slug: 'delver-music',
  //   title: 'Delver Music',
  //   text: 'If you want to learn Astro, you must read this book.',
  // },
]
