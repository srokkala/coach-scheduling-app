
export const isValidDate = (dateInput: string | Date | null | undefined): boolean => {
    if (!dateInput) return false;
    
    try {
      const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
      return !isNaN(date.getTime());
    } catch (error) {
      console.error("Date validation error:", error);
      return false;
    }
  };
  