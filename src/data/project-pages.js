import ddw01Image from '@/assets/images/projects/depth-array/DDW_01.jpg'
import ddw02Image from '@/assets/images/projects/depth-array/DDW_02.jpg'
import ddw03Image from '@/assets/images/projects/depth-array/DDW_03.jpg'

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
          url: 'https://vimeo.com/1125454072',
          title: 'Depth Array - Reflections by Robin Beekman',
        },
      },
    ],
  },
}

export default [
  projectsOverviewData,
  depthArrayData,
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
