module Util exposing (asList, ternary)

import Maybe


asList : Maybe (List a) -> List a
asList list =
    Maybe.withDefault [] list


ternary : Bool -> a -> a -> a
ternary cond pass fail =
    if cond then
        pass
    else
        fail
