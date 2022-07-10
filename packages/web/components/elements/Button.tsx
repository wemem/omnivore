import { styled } from '../tokens/stitches.config'

export const Button = styled('button', {
  fontFamily: 'inter',
  fontSize: '$2',
  lineHeight: '1.25',
  color: '$grayText',
  variants: {
    style: {
      ctaYellow: {
        borderRadius: '$3',
        px: '$3',
        py: '$2',
        border: '1px solid $yellow3',
        bg: '$yellow3',
        '&:hover': {
          bg: '$yellow4',
          border: '1px solid $grayBorderHover',
        },
      },
      ctaDarkYellow: {
        border: 0,
        fontSize: '14px',
        fontWeight: 500,
        fontStyle: 'normal',
        fontFamily: 'Inter',
        borderRadius: '8px',
        cursor: 'pointer',
        color: '$omnivoreGray',
        bg: '$omnivoreCtaYellow',
        p: '10px 12px',
      },
      ctaLightGray: {
        border: 0,
        fontSize: '14px',
        fontWeight: 500,
        fontStyle: 'normal',
        fontFamily: 'Inter',
        borderRadius: '8px',
        cursor: 'pointer',
        color: '$grayTextContrast',
        p: '10px 12px',
        bg: 'rgb(125, 125, 125, 0.1)',
        '&:hover': {
          bg: 'rgb(47, 47, 47, 0.1)',
          '.ctaButtonIcon': {
            visibility: 'visible',
          },
        },
        '.ctaButtonIcon': {
          visibility: 'hidden',
        }
      },
      ctaGray: {
        border: 0,
        fontSize: '14px',
        fontWeight: 500,
        fontStyle: 'normal',
        fontFamily: 'Inter',
        borderRadius: '8px',
        cursor: 'pointer',
        color: '$omnivoreGray',
        bg: '$grayBgActive',
        p: '10px 12px',
      },
      ctaWhite: {
        borderRadius: '$3',
        px: '$3',
        py: '$2',
        cursor: 'pointer',
        border: '1px solid $grayBgSubtle',
        bg: '$grayBgSubtle',
        '&:hover': {
          border: '1px solid $grayBorderHover',
        },
      },
      modalOption: {
        style: 'ghost',
        height: '52px',
        width: '100%',
        textAlign: 'left',
        verticalAlign: 'middle',
        color: '#0A0806',
        backgroundColor: 'unset',
        outlineColor: 'rgba(0, 0, 0, 0)',
        border: '1px solid rgba(0, 0, 0, 0.06)',
        cursor: 'pointer',
        '&:focus': { outline: 'none' },
      },
      ctaModal: {
        height: '32px',
        verticalAlign: 'middle',
        color: '$textDefault',
        backgroundColor: '$grayBase',
        fontWeight: '600',
        padding: '0px 12px',
        fontSize: '16px',
        border: '1px solid $grayBorder',
        cursor: 'pointer',
        borderRadius: '8px',
        '&:focus': { outline: 'none' },
      },
      ctaSecondary: {
        color: '$grayText',
        border: 'none',
        bg: 'transparent',
        '&:hover': {
          opacity: 0.8,
        },
      },
      ctaPill: {
        borderRadius: '$3',
        px: '$3',
        py: '$2',
        border: '1px solid $grayBorder',
        bg: '$grayBgActive',
        '&:hover': {
          bg: '$grayBgHover',
          border: '1px solid $grayBorderHover',
        },
      },
      circularIcon: {
        mx: '$1',
        display: 'flex',
        alignItems: 'center',
        fontWeight: 500,
        height: 44,
        width: 44,
        borderRadius: '50%',
        justifyContent: 'center',
        textAlign: 'center',
        background: '$grayBase',
        cursor: 'pointer',
        border: 'none',
        opacity: 0.9,
        '&:hover': {
          opacity: 1,
        },
      },
      squareIcon: {
        mx: '$1',
        display: 'flex',
        alignItems: 'center',
        fontWeight: 500,
        height: 44,
        width: 44,
        justifyContent: 'center',
        textAlign: 'center',
        background: '$grayBase',
        cursor: 'pointer',
        border: 'none',
        borderRight: '1px solid $grayText',
        opacity: 0.9,
        '&:hover': {
          opacity: 1,
        },
      },
      plainIcon: {
        bg: 'transparent',
        border: 'none',
        cursor: 'pointer',
        '&:hover': {
          opacity: 0.8,
        },
      },
      articleActionIcon: {
        bg: 'transparent',
        border: 'none',
        cursor: 'pointer',
        '&:hover': {
          opacity: 0.8,
        },
      },
      ghost: {
        color: 'transparent',
        border: 'none',
        bg: 'transparent',
        '&:hover': {
          opacity: 0.8,
        },
      },
      themeSwitch: {
        p: '0px',
        m: '0px',
        ml: '0px',
        width: '60px',
        height: '48px',
        fontSize: '14px',
        border: 'unset',
        borderRadius: '6px',
        '&:hover': {
          transform: 'scale(1.1)',
          border: '2px solid #F9D354',
        },
        '&[data-state="selected"]': {
          border: '2px solid #F9D354',
        }
      },
    },
  },
  defaultVariants: {
    style: 'ctaWhite',
  },
})
