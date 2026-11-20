/**
 * Mientras el backend no implemente los endpoints del contrato se usan datos de
 * demostración. En la integración I1 basta con ejecutar con VITE_USE_MOCKS=false
 * o cambiar este valor por defecto.
 */
export const USE_MOCKS: boolean = import.meta.env.VITE_USE_MOCKS !== 'false'
