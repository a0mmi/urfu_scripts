import math

def entropy_by_alphabet(s):
    L = len(s)
    if L == 0:
        return {}, 0.0
    counts = {}
    for ch in s:
        counts[ch] = counts.get(ch, 0) + 1
    alphabet = sorted(counts.keys())
    n = len(alphabet)
    freqs = {ch: counts[ch]/L for ch in alphabet}
    # логарифм по основанию n:
    H = 0.0
    for p in freqs.values():
        if p > 0:
            H -= p * (math.log(p) / math.log(n))  # log_n p = log p / log n
    return freqs, H

s = "abrakadabra"
freqs, H = entropy_by_alphabet(s)
print("freqs:", freqs)
print("H (base n):", H)   # ~0.87874099
