module Util exposing (asList, mapBoth, ternary)

import Maybe
import Tuple exposing (first, second)


asList : Maybe (List a) -> List a
asList list =
    Maybe.withDefault [] list


ternary : Bool -> a -> a -> a
ternary cond pass fail =
    if cond then
        pass
    else
        fail


mapBoth : (a -> b) -> ( a, a ) -> ( b, b )
mapBoth fn ( x, y ) =
    ( fn x
    , fn y
    )
