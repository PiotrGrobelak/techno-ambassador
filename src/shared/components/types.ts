// Apple Human Interface Guidelines Component Types

// Button Types
export type ButtonVariant = 'primary' | 'secondary' | 'destructive' | 'ghost' | 'link';
export type ButtonSize = 'small' | 'medium' | 'large';

// Input Types
export type InputVariant = 'default' | 'search' | 'email' | 'password' | 'number' | 'tel' | 'url';
export type InputSize = 'small' | 'medium' | 'large';

// Typography Types
export type TypographyVariant = 
  | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
  | 'body-large' | 'body' | 'body-small'
  | 'caption' | 'label' | 'overline';
export type TypographyWeight = 'light' | 'regular' | 'medium' | 'semibold' | 'bold';
export type TypographyAlign = 'left' | 'center' | 'right' | 'justify';
export type TypographyColor = 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'muted';

// Modal Types
export type ModalVariant = 'sheet' | 'alert' | 'fullscreen' | 'drawer';
export type ModalFriction = 'high' | 'low' | 'none';
export type ModalSize = 'small' | 'medium' | 'large' | 'xlarge';

// Card Types
export type CardVariant = 'elevated' | 'outlined' | 'filled' | 'ghost';
export type CardSize = 'small' | 'medium' | 'large'; 