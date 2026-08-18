```mermaid
flowchart TD
    A[Archivos SII .csv y .txt] -->|Se cargan en| B('Cargas' o bdd)
    B -->|Se procesan en| C{Herramienta Perfmon}
    C -->|Resulta en| D[.csv procesado]
    C -->|Resulta en| E[.txt procesado]