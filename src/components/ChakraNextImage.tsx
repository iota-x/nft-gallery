import NextImage, { ImageProps as NextImageProps } from 'next/image';
import { chakra } from '@chakra-ui/react';

const ChakraNextImage = chakra(NextImage, {
  shouldForwardProp: (prop) =>
    [
      'width',
      'height',
      'src',
      'alt',
      'quality',
      'priority',
      'placeholder',
      'blurDataURL',
      'loader',
      'layout',
      'objectFit',
      'objectPosition',
    ].includes(prop),
});

export default ChakraNextImage;
