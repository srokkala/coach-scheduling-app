import styled, { css } from 'styled-components';

type ButtonVariant = 'primary' | 'secondary' | 'success' | 'danger' | 'outline';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  disabled?: boolean;
}

const getButtonStyles = (variant: ButtonVariant, theme: any) => {
  switch (variant) {
    case 'primary':
      return css`
        background-color: ${theme.colors.primary};
        color: white;
        &:hover:not(:disabled) {
          background-color: ${theme.colors.primaryDark};
        }
      `;
    case 'secondary':
      return css`
        background-color: ${theme.colors.secondary};
        color: white;
        &:hover:not(:disabled) {
          background-color: ${theme.colors.secondaryDark};
        }
      `;
    case 'success':
      return css`
        background-color: ${theme.colors.success};
        color: white;
        &:hover:not(:disabled) {
          background-color: ${theme.colors.secondaryDark};
        }
      `;
    case 'danger':
      return css`
        background-color: ${theme.colors.error};
        color: white;
        &:hover:not(:disabled) {
          background-color: #dc2626;
        }
      `;
    case 'outline':
      return css`
        background-color: transparent;
        color: ${theme.colors.text};
        border: 1px solid ${theme.colors.border};
        &:hover:not(:disabled) {
          background-color: ${theme.colors.background};
        }
      `;
    default:
      return css`
        background-color: ${theme.colors.primary};
        color: white;
        &:hover:not(:disabled) {
          background-color: ${theme.colors.primaryDark};
        }
      `;
  }
};

const getButtonSize = (size: ButtonSize, theme: any) => {
  switch (size) {
    case 'sm':
      return css`
        padding: ${theme.spacing.xs} ${theme.spacing.md};
        font-size: ${theme.fontSizes.sm};
      `;
    case 'lg':
      return css`
        padding: ${theme.spacing.md} ${theme.spacing.xl};
        font-size: ${theme.fontSizes.lg};
      `;
    case 'md':
    default:
      return css`
        padding: ${theme.spacing.sm} ${theme.spacing.lg};
        font-size: ${theme.fontSizes.md};
      `;
  }
};

export const Button = styled.button<ButtonProps>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-weight: 500;
  border: none;
  transition: all 0.2s ease;
  
  ${({ variant = 'primary', theme }) => getButtonStyles(variant, theme)}
  ${({ size = 'md', theme }) => getButtonSize(size, theme)}
  
  ${({ fullWidth }) => fullWidth && css`
    width: 100%;
  `}
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;