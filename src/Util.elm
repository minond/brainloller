module Util exposing (asList, mapBoth)

import Maybe
import Tuple exposing (first, second)


asList : Maybe (List a) -> List a
asList list =
    Maybe.withDefault [] list


mapBoth : (a -> b) -> ( a, a ) -> ( b, b )
mapBoth fn ( x, y ) =
    ( fn x
    , fn y
    )
