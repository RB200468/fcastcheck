import random

def random_hex_colour():
    return "#{:06x}".format(random.randint(0,0xFFFFFF))