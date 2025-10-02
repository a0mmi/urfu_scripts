# Проверка на чётность
start:
    input 0
    set 1 2
    mod 0 1 2
    jz 2 even
    set 3 0
    jmp end
even:
    set 3 1
end:
    output 3